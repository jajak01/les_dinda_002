-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    school TEXT,
    grade TEXT,
    contact TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time TIME NOT NULL,
    subject TEXT DEFAULT 'Matematika',
    notes TEXT,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue')),
    payment_date DATE,
    price NUMERIC DEFAULT 20000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_payment_status ON sessions(payment_status);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_student_date ON sessions(student_id, date);

-- Add timestamps trigger to students table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add timestamps trigger to sessions table
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Students policies
CREATE POLICY "Users can view all students" ON students FOR SELECT USING (true);
CREATE POLICY "Users can insert students" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update students" ON students FOR UPDATE USING (true);
CREATE POLICY "Users can delete students" ON students FOR DELETE USING (true);

-- Sessions policies
CREATE POLICY "Users can view all sessions" ON sessions FOR SELECT USING (true);
CREATE POLICY "Users can insert sessions" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update sessions" ON sessions FOR UPDATE USING (true);
CREATE POLICY "Users can delete sessions" ON sessions FOR DELETE USING (true);

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Admins/Users policies: only allow database backend access, no public read/write
CREATE POLICY "Only admin can view users" ON users FOR SELECT TO authenticated USING (true);

-- Create timestamp trigger for users
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Authentication helper RPC function
CREATE OR REPLACE FUNCTION authenticate_user(p_username TEXT, p_password TEXT)
RETURNS TABLE (id UUID, username TEXT, role TEXT, authenticated BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.username, u.role, (u.password_hash = crypt(p_password, u.password_hash)) AS authenticated
    FROM users u
    WHERE u.username = p_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed an admin user (username: admin, password: adminpassword)
-- The password_hash uses crypt('adminpassword', gen_salt('bf'))
INSERT INTO users (username, password_hash, role)
VALUES ('admin', crypt('adminpassword', gen_salt('bf')), 'admin')
ON CONFLICT (username) DO UPDATE 
SET password_hash = crypt('adminpassword', gen_salt('bf'));


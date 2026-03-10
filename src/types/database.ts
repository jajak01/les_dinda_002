export interface Student {
  id: string
  name: string
  school?: string
  grade?: string
  contact?: string
  address?: string
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  student_id: string
  student?: Student
  date: string
  time: string
  subject?: string
  notes?: string
  status: 'scheduled' | 'completed' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'overdue'
  payment_date?: string
  price?: number
  created_at: string
  updated_at: string
}

export interface Stats {
  total_students: number
  today_sessions: number
  this_week_sessions: number
  this_month_revenue: number
  pending_payments: number
}

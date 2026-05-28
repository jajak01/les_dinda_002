'use server'

import { revalidatePath } from 'next/cache'
import { supabaseServer } from './server'
import type { Student, Session } from '@/types/database'

// Student Actions
export async function getStudents(): Promise<Student[]> {
  const { data, error } = await supabaseServer
    .from('students')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data as Student[]
}

export async function getStudent(id: string): Promise<Student> {
  const { data, error } = await supabaseServer
    .from('students')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Student
}

export async function createStudent(formData: FormData) {
  const name = formData.get('name') as string

  // Validate required fields
  if (!name || name.trim() === '') {
    throw new Error('Nama wajib diisi!')
  }

  const school = formData.get('school') as string || null
  const grade = formData.get('grade') as string || null
  const contact = formData.get('contact') as string || null
  const address = formData.get('address') as string || null

  const { data, error } = await supabaseServer
    .from('students')
    .insert({
      name: name.trim(),
      school,
      grade,
      contact,
      address,
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/students')
  return data as Student
}

export async function updateStudent(id: string, formData: FormData) {
  const name = formData.get('name') as string
  const school = formData.get('school') as string
  const grade = formData.get('grade') as string
  const contact = formData.get('contact') as string
  const address = formData.get('address') as string

  const { data, error } = await supabaseServer
    .from('students')
    .update({
      name,
      school,
      grade,
      contact,
      address,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/students')
  revalidatePath(`/students/${id}`)
  return data as Student
}

export async function deleteStudent(id: string) {
  const { error } = await supabaseServer
    .from('students')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/students')
}

// Session Actions
export async function getSessions(filters?: {
  startDate?: string
  endDate?: string
  status?: string
  paymentStatus?: string
  search?: string
  studentId?: string
}): Promise<Session[]> {
  // 1. CHANGE: Use "!inner" to allow filtering by student fields
  let query = supabaseServer
    .from('sessions')
    .select('*, student:students!inner(*)') 
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (filters?.startDate) {
    query = query.gte('date', filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte('date', filters.endDate)
  }
  
  // 2. FIX: Ensure these match your database column names exactly
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
    query = query.eq('payment_status', filters.paymentStatus)
  }

  if (filters?.studentId) {
    query = query.eq('student_id', filters.studentId)
  }

  // 3. FIX: Relational filtering requires the !inner join above
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,contact.ilike.%${filters.search}%`, { foreignTable: 'student' })
  }

  const { data, error } = await query

  if (error) throw error
  return data as Session[]
}

export async function getSession(id: string) {
  const { data, error } = await supabaseServer
    .from('sessions')
    .select('*, student:students(*)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Session
}

export async function createSession(formData: FormData) {
  const student_id = formData.get('student_id') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const notes = formData.get('notes') as string
  
  // Floating Logic: Use value if typed, otherwise use default
  const rawSubject = formData.get('subject') as string
  const subject = (!rawSubject || rawSubject.trim() === '') ? 'isikan mapel' : rawSubject

  const priceStr = formData.get('price') as string
  const price = (!priceStr || priceStr.trim() === '') ? 20000 : parseFloat(priceStr)

  if (!student_id || !date || !time) throw new Error('Missing required fields')

  const { data, error } = await supabaseServer
    .from('sessions')
    .insert({
      student_id,
      date,
      time,
      subject,
      notes,
      price,
      status: formData.get('status') || 'scheduled',
      payment_status: formData.get('payment_status') || 'pending',
    })
    .select().single()

  if (error) throw error
  revalidatePath('/sessions')
  return data as Session
}

export async function updateSession(id: string, formData: FormData): Promise<Session> {
  const updateData: Record<string, string | number | null> = {}

  // List of possible fields to extract from formData
  const fields = ['date', 'time', 'notes', 'status', 'payment_status', 'payment_date', 'subject', 'price']

  fields.forEach((field) => {
    const value = formData.get(field)
    
    // Only add to update object if the field exists in formData
    if (value !== null) {
      if (field === 'price') {
        updateData.price = value === '' ? 20000 : parseFloat(value as string)
      } else if (field === 'subject') {
        updateData.subject = value === '' ? 'isikan mapel' : (value as string)
      } else {
        updateData[field] = value === '' ? null : (value as string)
      }
    }
  })

  // If status is updated to something other than 'paid', clear payment_date
  if (updateData.payment_status && updateData.payment_status !== 'paid') {
    updateData.payment_date = null
  }

  const { data, error } = await supabaseServer
    .from('sessions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Update Error:', error)
    throw error
  }
  
  revalidatePath('/sessions')
  return data as Session
}

export async function deleteSession(id: string) {
  const { error } = await supabaseServer
    .from('sessions')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/sessions')
}

// Dashboard Stats
export async function getDashboardStats(filters?: { startDate?: string; endDate?: string }) {
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  
  // Define the date range for filtering
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const effectiveStartDate = filters?.startDate || startOfMonth
  const effectiveEndDate = filters?.endDate || todayStr

  // 1. Fetch data with database-level filtering for efficiency
  const [sessionsResponse, studentsResponse, todaySessionsResponse] = await Promise.all([
    // Filtered sessions for the range
    supabaseServer
      .from('sessions')
      .select('price, payment_status, status, date')
      .gte('date', effectiveStartDate)
      .lte('date', effectiveEndDate)
      .neq('status', 'cancelled'),
    
    // Total students count
    supabaseServer.from('students').select('id', { count: 'exact', head: true }),
    
    // Today's sessions count
    supabaseServer
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('date', todayStr)
      .neq('status', 'cancelled')
  ])

  if (sessionsResponse.error) throw sessionsResponse.error
  if (studentsResponse.error) throw studentsResponse.error
  if (todaySessionsResponse.error) throw todaySessionsResponse.error

  const sessions = sessionsResponse.data || []

  // 2. MATH CALCULATIONS
  
  // Pendapatan Selesai (Paid sessions within filter range)
  const revenueSelesai = sessions
    .filter(s => s.payment_status === 'paid')
    .reduce((sum, s) => sum + (Number(s.price) || 0), 0)

  // Pendapatan Pending (Pending sessions within filter range)
  const revenuePending = sessions
    .filter(s => s.payment_status === 'pending')
    .reduce((sum, s) => sum + (Number(s.price) || 0), 0)

  // TOTAL OMZET (The sum of both Selesai + Pending within the filter range)
  const totalOmzet = revenueSelesai + revenuePending

  return {
    total_students: studentsResponse.count || 0,
    today_sessions: todaySessionsResponse.count || 0,
    this_week_sessions: sessions.length, 
    this_month_revenue: revenueSelesai,
    pending_payments: revenuePending,
    total_omzet: totalOmzet,
  }
}

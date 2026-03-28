'use client'

interface Student {
  id: string;
  name: string;
  school?: string;
  grade?: string;
}

interface Session {
  id: string;
  student_id: string;
  student?: Student;
  date: string;
  time: string;
  subject?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'overdue';
  payment_date?: string;
  price?: number;
  created_at: string;
}

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, Calendar, Clock, DollarSign, CheckCircle, XCircle, Loader2, ArrowLeft, ArrowRight, Filter, Plus, ChevronDown, ChevronRight, Trash2, Edit } from 'lucide-react'
import { getSessions, updateSession, deleteSession, getStudents } from '@/lib/supabase/actions'
import { format, parseISO, subMonths, addMonths } from 'date-fns'

// ... (Keep your Interfaces/Types)

export default function MonthlyGroupingPage() {
  const [allSessions, setAllSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
  })

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  useEffect(() => { loadSessions() }, [])

  const loadSessions = async () => {
    setLoading(true)
    try {
      const data = await getSessions()
      setAllSessions(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const resetFilters = () => {
    setSearchQuery('')
    setFilters({ status: 'all', paymentStatus: 'all' })
  }

  // Grouping Logic
  const monthlyGroupedSessions = useMemo(() => {
    const grouped: { [key: string]: Session[] } = {}
    allSessions.forEach((session) => {
      const monthKey = format(parseISO(session.date), 'yyyy-MM')
      if (!grouped[monthKey]) grouped[monthKey] = []
      grouped[monthKey].push(session)
    })
    return Object.entries(grouped).map(([monthKey, sessions]) => {
      const [year, month] = monthKey.split('-').map(Number)
      return { 
        monthKey, 
        sessions, 
        monthName: format(new Date(year, month - 1), 'MMMM yyyy') 
      }
    }).sort((a, b) => b.monthKey.localeCompare(a.monthKey))
  }, [allSessions])

  const filteredMonthlyGroups = useMemo(() => {
    return monthlyGroupedSessions.map((group) => {
      const filteredSessions = group.sessions.filter((session) => {
        const searchMatch = searchQuery === '' || 
          session.student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          session.subject?.toLowerCase().includes(searchQuery.toLowerCase());
        const statusMatch = filters.status === 'all' || session.status === filters.status;
        const paymentMatch = filters.paymentStatus === 'all' || session.payment_status === filters.paymentStatus;
        return searchMatch && statusMatch && paymentMatch;
      });
      return { ...group, sessions: filteredSessions };
    });
  }, [monthlyGroupedSessions, searchQuery, filters]);

  // Handlers
  const handleEdit = (session: Session) => { setSelectedSession(session); setIsFormOpen(true); }
  const handleDelete = async (id: string) => {
    if (confirm('Hapus sesi?')) { await deleteSession(id); loadSessions(); }
  }
  const updateSessionStatus = async (id: string, s: string) => {
    const fd = new FormData(); fd.append('status', s);
    await updateSession(id, fd); loadSessions();
  }
  const updatePaymentStatus = async (id: string, p: string) => {
    const fd = new FormData(); fd.append('payment_status', p);
    if (p === 'paid') fd.append('payment_date', new Date().toISOString().split('T')[0]);
    await updateSession(id, fd); loadSessions();
  }

  return (
    <div className="space-y-6 p-4">
      {/* 1. CLEAN HEADER (Removed extra buttons) */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Jadwal Sesi per Bulan</h1>
          <p className="text-slate-500">Kelola dan pantau jadwal les privat.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setSelectedMonth(prev => subMonths(prev, 1))}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setSelectedMonth(prev => addMonths(prev, 1))}>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 2. THE SINGLE FILTER BOX (Styled exactly as your image) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="space-y-4 p-4 bg-white rounded-lg border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Filter Sesi</h3>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-slate-500">
              <XCircle className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Cari Siswa</Label>
              <Input id="search" placeholder="Nama atau kontak..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Periode Bulan</Label>
              <Input type="month" value={format(selectedMonth, 'yyyy-MM')} onChange={(e) => setSelectedMonth(new Date(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Status Jadwal</Label>
              <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="all">Semua Status</option>
                <option value="scheduled">Jadwal</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Batal</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Status Pembayaran</Label>
              <select value={filters.paymentStatus} onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="all">Semua Status</option>
                <option value="paid">Lunas</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="flex-1 bg-slate-900 text-white" onClick={loadSessions}>
              <Filter className="mr-2 h-4 w-4" /> Terapkan Filter
            </Button>
            <Button variant="outline" className="border-indigo-200 text-indigo-700" onClick={() => { setSelectedSession(null); setIsFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Sesi Baru
            </Button>
          </div>
        </div>
      </div>

      {/* 3. GROUPED LIST */}
      <div className="space-y-4">
        {filteredMonthlyGroups.map((group) => (
          <Card key={group.monthKey} className="overflow-hidden">
            <CardHeader 
              className="bg-slate-50 border-b cursor-pointer py-3" 
              onClick={() => setExpandedMonth(expandedMonth === group.monthKey ? null : group.monthKey)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 font-bold">
                  {expandedMonth === group.monthKey ? <ChevronDown /> : <ChevronRight />}
                  {group.monthName}
                </div>
                <Badge variant="secondary">{group.sessions.length} Sesi</Badge>
              </div>
            </CardHeader>

            <CardContent className={expandedMonth === group.monthKey ? "p-0" : "hidden"}>
              <div className="divide-y">
                {group.sessions.map((session) => (
                  <div key={session.id} className="p-4 hover:bg-slate-50">
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{session.student?.name}</h3>
                          <div className="flex gap-3 text-sm text-slate-500 mt-1">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {format(parseISO(session.date), 'dd MMM yyyy')}</span>
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {session.time}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-indigo-600">Rp {session.price?.toLocaleString('id-ID')}</div>
                          <div className="text-xs text-slate-400">{session.subject}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>{session.status}</Badge>
                        <Badge className={session.payment_status === 'paid' ? 'bg-green-600' : 'bg-yellow-500'}>{session.payment_status}</Badge>
                        {session.payment_date && <span className="text-xs text-slate-500">Tgl Bayar: {format(parseISO(session.payment_date), 'dd/MM/yy')}</span>}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(session)}><Edit className="h-3 w-3 mr-1" /> Edit</Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button size="sm" variant="outline">Status <ChevronDown className="h-3 w-3 ml-1" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => updateSessionStatus(session.id, 'scheduled')}>Scheduled</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateSessionStatus(session.id, 'completed')}>Completed</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateSessionStatus(session.id, 'cancelled')}>Cancelled</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button size="sm" variant="outline">Pembayaran <ChevronDown className="h-3 w-3 ml-1" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => updatePaymentStatus(session.id, 'pending')}>Pending</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updatePaymentStatus(session.id, 'paid')}>Lunas</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updatePaymentStatus(session.id, 'overdue')}>Overdue</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 ml-auto" onClick={() => handleDelete(session.id)}><Trash2 className="h-3 w-3 mr-1" /> Delete</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedSession ? 'Edit Sesi' : 'Tambah Sesi'}</DialogTitle></DialogHeader>
          <SessionFormDialog session={selectedSession} onSuccess={() => { setIsFormOpen(false); loadSessions(); }} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SessionFormDialog({ session, onSuccess }: { session: Session | null, onSuccess: () => void }) {
  const [open, setOpen] = useState(true)
  const [students, setStudents] = useState<Student[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    student_id: session?.student_id || '',
    date: session?.date || new Date().toISOString().split('T')[0],
    time: session?.time || '',
    subject: session?.subject || '',
    notes: session?.notes || '',
    price: session?.price?.toString() || '20000',
    status: session?.status || 'scheduled',
    payment_status: session?.payment_status || 'pending',
    payment_date: session?.payment_date || '',
  })

  useEffect(() => {
    if (session) {
      setFormData({
        student_id: session.student_id || '',
        date: session.date || new Date().toISOString().split('T')[0],
        time: session.time || '',
        subject: session.subject || '',
        notes: session.notes || '',
        price: session.price?.toString() || '20000',
        status: session.status || 'scheduled',
        payment_status: session.payment_status || 'pending',
        payment_date: session.payment_date || '',
      })
    }
  }, [session])

  useEffect(() => {
    if (open) {
      loadStudents()
    }
  }, [open])

  const loadStudents = async () => {
    try {
      const data = await getStudents()
      setStudents(data)
    } catch (error) {
      console.error('Error loading students:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { createSession, updateSession } = await import('@/lib/supabase/actions')

      const formDataObj = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formDataObj.append(key, value.toString())
        }
      })

      if (session) {
        await updateSession(session.id, formDataObj)
      } else {
        await createSession(formDataObj)
      }

      setOpen(false)
      onSuccess()
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Terjadi kesalahan saat menyimpan data')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="student_id">Pilih Siswa</Label>
        <select
          id="student_id"
          required
          value={formData.student_id}
          onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Pilih siswa</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} {student.school ? ` (${student.school})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Tanggal</Label>
          <Input
            id="date"
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Waktu</Label>
          <Input
            id="time"
            type="time"
            required
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subjek</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="isikan mapel..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status Jadwal</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ 
                ...formData, 
                status: e.target.value as 'scheduled' | 'completed' | 'cancelled' 
              })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
            <option value="scheduled">Jadwal</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Batal</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment_status">Status Bayar</Label>
          <select
            id="payment_status"
            value={formData.payment_status}
            onChange={(e) => setFormData({ 
              ...formData, 
              payment_status: e.target.value as 'pending' | 'paid' | 'overdue' 
            })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="paid">Lunas</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {formData.payment_status === 'paid' && (
        <div className="space-y-2">
          <Label htmlFor="payment_date">Tanggal Pembayaran</Label>
          <Input
            id="payment_date"
            type="date"
            value={formData.payment_date}
            onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="price">Harga (IDR)</Label>
        <Input
          id="price"
          type="number"
          min="0"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          placeholder="20000"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Catatan (Opsional)</Label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Tambahkan catatan..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Batal
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'Simpan'}
        </Button>
      </div>
    </form>
  )
}

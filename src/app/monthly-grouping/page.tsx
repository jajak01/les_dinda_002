'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Calendar, Clock, XCircle, ArrowLeft, ArrowRight, Filter, Plus, ChevronDown, ChevronRight, Trash2, Edit } from 'lucide-react'
import { getSessions, updateSession, deleteSession } from '@/lib/supabase/actions'
import { format, parseISO, subMonths, addMonths } from 'date-fns'
import SessionForm from '@/components/sessions/SessionForm'
import type { Session } from '@/types/database'


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

  useEffect(() => {
    setExpandedMonth(format(selectedMonth, 'yyyy-MM'))
  }, [selectedMonth])

  const filteredMonthlyGroups = useMemo(() => {
    const targetMonthKey = format(selectedMonth, 'yyyy-MM')
    return monthlyGroupedSessions
      .filter((group) => group.monthKey === targetMonthKey)
      .map((group) => {
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
  }, [monthlyGroupedSessions, selectedMonth, searchQuery, filters]);

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

      <SessionForm
        session={selectedSession}
        open={isFormOpen}
        setOpen={setIsFormOpen}
        onSuccess={() => {
          setIsFormOpen(false)
          loadSessions()
        }}
      />
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format } from 'date-fns'
// 1. Added Edit2, Save, and Plus icons for the new editing UI
import { Calendar, CheckCircle, XCircle, DollarSign, Loader2, AlertCircle, ArrowRight, StickyNote, Edit2, Save, Plus } from 'lucide-react'
import { getSessions } from '@/lib/supabase/actions'
import type { Session } from '@/types/database'

interface DailyCheckInProps {
  onSuccess?: () => void
}

type SessionWithStudent = Session & {
  student?: {
    name: string
    school?: string
  }
  notes?: string; 
  note?: string; 
  catatan?: string; 
  payment_date?: string
}

export default function DailyCheckIn({ onSuccess }: DailyCheckInProps) {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  
  const [sessions, setSessions] = useState<SessionWithStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  
  // 2. State for editing notes
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editNoteValue, setEditNoteValue] = useState('')

  const [summary, setSummary] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    paid: 0,
    pendingPayment: 0
  })

  useEffect(() => {
    loadSessions()
  }, [startDate, endDate])

  const loadSessions = async (silent = false) => {
    if (!silent) {
      setLoading(true)
    }

    setError(null)
    try {
      const allSessions = await getSessions()
      const rangeSessions = allSessions.filter((s: SessionWithStudent) => {
        return s.date >= startDate && s.date <= endDate
      })
      const validSessions = rangeSessions.filter((s: SessionWithStudent) => s.student)
      setSessions(validSessions)
    } catch (error: any) {
      console.error('Error loading sessions:', error)
      setError(error.message || 'Gagal memuat data sesi')
      setSessions([])
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }

  // 3. New function to save the note to Supabase
  const updateSessionNote = async (id: string) => {
    setUpdating(id)
    try {
      const { updateSession } = await import('@/lib/supabase/actions')
      const formData = new FormData()
      
      // CHANGE 'notes' TO 'catatan' IF THAT IS YOUR SUPABASE COLUMN NAME
      formData.append('notes', editNoteValue) 
      
      await updateSession(id, formData)
      await loadSessions(true)
      setEditingNoteId(null) // Close the editor
      onSuccess?.()
    } catch (error: any) {
      setError(error.message || 'Gagal menyimpan catatan')
    } finally {
      setUpdating(null)
    }
  }

  const updateSessionStatus = async (id: string, status: 'scheduled' | 'completed' | 'cancelled') => {
    setUpdating(id)
    try {
      const { updateSession } = await import('@/lib/supabase/actions')
      const formData = new FormData()
      formData.append('status', status)
      await updateSession(id, formData)
      await loadSessions(true)
      onSuccess?.()
    } catch (error: any) {
      setError(error.message || 'Gagal mengupdate status sesi')
    } finally {
      setUpdating(null)
    }
  }

  const updatePaymentStatus = async (id: string, paymentStatus: 'pending' | 'paid' | 'overdue') => {
    setUpdating(id)
    try {
      const { updateSession } = await import('@/lib/supabase/actions')
      const formData = new FormData()
      if (paymentStatus === 'paid') {
        formData.append('payment_status', 'paid')
        formData.append('payment_date', new Date().toISOString().split('T')[0])
      } else {
        formData.append('payment_status', paymentStatus)
      }
      await updateSession(id, formData)
      await loadSessions(true)
      onSuccess?.()
    } catch (error: any) {
      setError(error.message || 'Gagal mengupdate status pembayaran')
    } finally {
      setUpdating(null)
    }
  }

  useEffect(() => {
    const total = sessions.length
    const completed = sessions.filter(s => s.status === 'completed').length
    const paid = sessions.filter(s => s.payment_status === 'paid').length
    const pendingPayment = sessions.filter(
      s => s.payment_status === 'pending' || s.payment_status === 'overdue'
    ).length

    setSummary({
      total,
      completed,
      pending: total - completed,
      paid,
      pendingPayment
    })
  }, [sessions])

  const getSessionStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><span className="text-sm font-medium text-green-600">Selesai</span></div>
      case 'cancelled': return <div className="flex items-center gap-2"><XCircle className="h-4 w-4 text-red-500" /><span className="text-sm font-medium text-red-600">Batal</span></div>
      default: return <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-500" /><span className="text-sm font-medium text-gray-600">Jadwal</span></div>
    }
  }

  const getPaymentStatusBadge = (paymentStatus: string, paymentDate?: string) => {
    const formattedDate = paymentDate
      ? format(new Date(paymentDate), 'dd MMM yyyy')
      : null

    switch (paymentStatus) {
      case 'paid':
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-600">Lunas</span>
            </div>
            {formattedDate && (
              <span className="text-xs text-gray-500 ml-6">
                {formattedDate}
              </span>
            )}
          </div>
        )

      case 'overdue':
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-600">Overdue</span>
            </div>
          </div>
        )

      default:
        return (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-yellow-600">Pending</span>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Calendar className="h-6 w-6 text-blue-600" />
            Laporan Harian
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-semibold text-gray-700">Dari Tanggal</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full sm:w-[200px]" />
            </div>
            <div className="flex items-center justify-center pb-2">
              <ArrowRight className="h-5 w-5 text-gray-400 hidden sm:block" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700">Sampai Tanggal</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full sm:w-[200px]" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="p-4 rounded-lg border-2 bg-blue-50">
              <p className="text-xs font-medium text-blue-700 mb-1">Total Sesi</p>
              <p className="text-3xl font-bold text-blue-700">{summary.total}</p>
            </div>
            <div className="p-4 rounded-lg border-2 bg-green-50">
              <p className="text-xs font-medium text-green-700 mb-1">Selesai</p>
              <p className="text-3xl font-bold text-green-700">{summary.completed}</p>
            </div>
            <div className="p-4 rounded-lg border-2 bg-red-50">
              <p className="text-xs font-medium text-red-700 mb-1">Belum Selesai</p>
              <p className="text-3xl font-bold text-red-700">{summary.pending}</p>
            </div>
            <div className="p-4 rounded-lg border-2 bg-green-100">
              <p className="text-xs font-medium text-green-800 mb-1">Lunas</p>
              <p className="text-3xl font-bold text-green-800">{summary.paid}</p>
            </div>
            <div className="p-4 rounded-lg border-2 bg-yellow-50">
              <p className="text-xs font-medium text-yellow-700 mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-700">{summary.pendingPayment}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Calendar className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-lg text-gray-600 mb-2">Tidak ada sesi untuk rentang tanggal ini</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                const sessionNote = session.notes || session.note || session.catatan || '';
                const isEditingNote = editingNoteId === session.id;

                return (
                  <Card key={session.id} className="border-2 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{session.student?.name}</h3>
                            <p className="text-sm text-gray-600">{session.student?.school}</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{format(new Date(session.date), 'dd MMM yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-lg">
                              <ClockIcon />
                              <span className="font-medium">{session.time}</span>
                            </div>
                            {session.subject && (
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                                {session.subject}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {getSessionStatusBadge(session.status)}
                            {getPaymentStatusBadge(session.payment_status, session.payment_date)}
                          </div>

                          {/* 4. The New Interactive Notes Section */}
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-xs font-semibold text-gray-700 uppercase flex items-center gap-1">
                                <StickyNote className="h-3 w-3" /> Catatan Sesi
                              </Label>
                              {!isEditingNote && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                  onClick={() => {
                                    setEditingNoteId(session.id);
                                    setEditNoteValue(sessionNote);
                                  }}
                                >
                                  {sessionNote ? <><Edit2 className="h-3 w-3 mr-1"/> Edit</> : <><Plus className="h-3 w-3 mr-1"/> Tambah</>}
                                </Button>
                              )}
                            </div>

                            {isEditingNote ? (
                              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <textarea
                                  value={editNoteValue}
                                  onChange={(e) => setEditNoteValue(e.target.value)}
                                  placeholder="Ketik catatan untuk sesi ini (materi, PR, dll)..."
                                  className="w-full min-h-[80px] p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
                                  autoFocus
                                />
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm" onClick={() => setEditingNoteId(null)}>
                                    Batal
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    className="bg-indigo-600 hover:bg-indigo-700" 
                                    onClick={() => updateSessionNote(session.id)}
                                    disabled={updating === session.id}
                                  >
                                    {updating === session.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                                    Simpan
                                  </Button>
                                </div>
                              </div>
                            ) : sessionNote ? (
                              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-lg group transition-colors">
                                <p className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">
                                  {sessionNote}
                                </p>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">Belum ada catatan.</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[240px]">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700 uppercase">Status Sesi</Label>
                            <div className="flex gap-2">
                              <Button size="sm" variant={session.status === 'scheduled' ? 'default' : 'outline'} onClick={() => updateSessionStatus(session.id, 'scheduled')} disabled={updating === session.id} className="flex-1">Jadwal</Button>
                              <Button size="sm" variant={session.status === 'completed' ? 'default' : 'outline'} onClick={() => updateSessionStatus(session.id, 'completed')} disabled={updating === session.id} className={session.status === 'completed' ? 'bg-green-600 hover:bg-green-700 flex-1' : 'flex-1'}>Selesai</Button>
                              <Button size="sm" variant={session.status === 'cancelled' ? 'default' : 'outline'} onClick={() => updateSessionStatus(session.id, 'cancelled')} disabled={updating === session.id} className="flex-1">Batal</Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700 uppercase">Status Pembayaran</Label>
                            <div className="flex gap-2">
                              <Button size="sm" variant={session.payment_status === 'pending' ? 'default' : 'outline'} onClick={() => updatePaymentStatus(session.id, 'pending')} disabled={updating === session.id} className="flex-1">Pending</Button>
                              <Button size="sm" variant={session.payment_status === 'paid' ? 'default' : 'outline'} onClick={() => updatePaymentStatus(session.id, 'paid')} disabled={updating === session.id} className="flex-1">Lunas</Button>
                              <Button size="sm" variant={session.payment_status === 'overdue' ? 'destructive' : 'outline'} onClick={() => updatePaymentStatus(session.id, 'overdue')} disabled={updating === session.id} className="flex-1">Overdue</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-gray-500">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
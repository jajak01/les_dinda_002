'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { format, parseISO } from 'date-fns'
import { Edit, Trash2, Calendar, Clock, DollarSign, CheckCircle, Loader2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { updateSession } from '@/lib/supabase/actions'

interface SessionListProps {
  sessions: any[]
  onEdit: (session: any) => void
  onDelete: (id: string) => void
}

export default function SessionList({ sessions, onEdit, onDelete }: SessionListProps) {
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  // --- HELPER FUNCTIONS (Fixes the undefined error) ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return <Badge className="bg-green-500">Jadwal</Badge>
      case 'completed': return <Badge className="bg-blue-500">Selesai</Badge>
      case 'cancelled': return <Badge variant="destructive">Batal</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  const getPaymentBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid': return <Badge className="bg-green-600 ml-2">Lunas</Badge>
      case 'pending': return <Badge className="bg-yellow-500 text-black ml-2">Pending</Badge>
      case 'overdue': return <Badge className="bg-red-500 ml-2">Overdue</Badge>
      default: return <Badge className="ml-2">{paymentStatus}</Badge>
    }
  }

  // --- ACTIONS ---
  const handleQuickComplete = async (session: any) => {
    if (confirm('Tandai sesi ini sebagai selesai dan lunas?')) {
      setIsSaving(true)
      try {
        const formData = new FormData()
        formData.append('status', 'completed')
        formData.append('payment_status', 'paid')
        formData.append('payment_date', new Date().toISOString().split('T')[0])

        const updatedData = await updateSession(session.id, formData)
        onEdit(updatedData)
        setSelectedSession(null)
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleQuickCancel = async (session: any) => {
    if (confirm('Batalkan sesi ini? Sesi batal tidak akan dihitung dalam pendapatan.')) {
      setIsSaving(true)
      try {
        const formData = new FormData()
        formData.append('status', 'cancelled')
        
        const updatedData = await updateSession(session.id, formData)
        onEdit(updatedData)
      } catch (error) {
        console.error("Error cancelling:", error)
      } finally {
        setIsSaving(false)
      }
    }
  }

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      const updatedData = await updateSession(selectedSession.id, formData)
      onEdit(updatedData)
      setSelectedSession(null)
    } catch (error) {
      alert("Gagal menyimpan.")
    } finally {
      setIsSaving(false)
    }
  }

  if (sessions.length === 0) {
    return (
      <Card><CardContent className="py-12 text-center text-gray-500"><Calendar className="mx-auto mb-4 h-12 w-12 opacity-20" />Tidak ada sesi ditemukan</CardContent></Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <Card key={session.id} className={`hover:shadow-md transition-shadow ${session.status === 'cancelled' ? 'opacity-60 grayscale' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{session.student?.name || 'Siswa Tidak Dikenal'}</CardTitle>
              <p className="text-sm text-muted-foreground">{session.student?.school}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-gray-400" />{format(parseISO(session.date), 'dd MMM yyyy')}</div>
              <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-gray-400" />{session.time}</div>
              <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                <DollarSign className="h-4 w-4" />
                Rp {session.price?.toLocaleString('id-ID')}
              </div>
              
              <div className="flex items-center">
                {getStatusBadge(session.status)}
                {getPaymentBadge(session.payment_status)}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedSession(session)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>

                {/* --- QUICK CANCEL BUTTON --- */}
                {session.status !== 'cancelled' && (
                  <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleQuickCancel(session)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}

                <Button variant="destructive" size="sm" onClick={() => onDelete(session.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedSession} onOpenChange={() => !isSaving && setSelectedSession(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Sesi: {selectedSession?.student?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedSession && (
            <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Input name="date" type="date" defaultValue={selectedSession.date} required disabled={isSaving} />
                </div>
                <div className="space-y-2">
                  <Label>Waktu</Label>
                  <Input name="time" type="time" defaultValue={selectedSession.time} required disabled={isSaving} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subjek</Label>
                <Input name="subject" defaultValue={selectedSession.subject || 'Matematika'} disabled={isSaving} />
              </div>

              <div className="space-y-2">
                <Label>Harga (Rp)</Label>
                <Input name="price" type="number" defaultValue={selectedSession.price} disabled={isSaving} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status Jadwal</Label>
                  <select name="status" defaultValue={selectedSession.status} disabled={isSaving} className="w-full h-10 px-3 rounded-md border text-sm bg-background">
                    <option value="scheduled">Jadwal</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Batal</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Status Bayar</Label>
                  <select name="payment_status" defaultValue={selectedSession.payment_status} disabled={isSaving} className="w-full h-10 px-3 rounded-md border text-sm bg-background">
                    <option value="pending">Pending</option>
                    <option value="paid">Lunas</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={isSaving}>
                  {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</> : 'Simpan Perubahan'}
                </Button>
                
                {selectedSession.status !== 'completed' && selectedSession.status !== 'cancelled' && (
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="w-full bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                    onClick={() => handleQuickComplete(selectedSession)}
                    disabled={isSaving}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Selesaikan & Lunas
                  </Button>
                )}
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
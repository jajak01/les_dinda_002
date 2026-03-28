'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getStudents } from '@/lib/supabase/actions'
import { Calendar, Clock } from 'lucide-react'

interface SessionFormProps {
  session?: any
  onSuccess?: () => void
}

export default function SessionForm({ session, onSuccess }: SessionFormProps) {
  const [open, setOpen] = useState(false)
  const [students, setStudents] = useState<any[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Initial State: Set values to empty strings if no session exists
  // This allows the placeholder to show up as "floating" text
  const [formData, setFormData] = useState({
    student_id: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    subject: '',
    notes: '',
    price: '',
    status: 'scheduled',
    payment_status: 'pending',
    payment_date: '',
  })

  // Load session data when editing
  useEffect(() => {
    if (session) {
      setFormData({
        student_id: session.student_id || '',
        date: session.date || new Date().toISOString().split('T')[0],
        time: session.time || '',
        subject: session.subject || '',
        notes: session.notes || '',
        price: session.price?.toString() || '',
        status: session.status || 'scheduled',
        payment_status: session.payment_status || 'pending',
        payment_date: session.payment_date || '',
      })
    }
  }, [session])

  useEffect(() => {
    if (open) {
      const loadStudents = async () => {
        try {
          const data = await getStudents()
          setStudents(data)
        } catch (error) {
          console.error('Error loading students:', error)
        }
      }
      loadStudents()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    // Validation
    if (!formData.student_id) {
      alert('Pilih siswa wajib!')
      setSubmitting(false)
      return
    }

    // Apply logical defaults ONLY if the user left them empty
    const finalData = {
      ...formData,
      subject: formData.subject.trim() === '' ? 'isikan mapel...' : formData.subject,
      price: formData.price === '' ? 20000 : parseInt(formData.price),
    }

    try {
      const { createSession, updateSession } = await import('@/lib/supabase/actions')

      const formDataObj = new FormData()
      Object.entries(finalData).forEach(([key, value]) => {
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
      onSuccess?.()
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Terjadi kesalahan saat menyimpan data')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          {session ? 'Edit Sesi' : 'Tambah Sesi'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{session ? 'Edit Sesi' : 'Tambah Sesi Baru'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          
          {/* Student Selection */}
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

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Waktu</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="time"
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Subject with Floating Placeholder */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subjek</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="isikan mapel..."
            />
          </div>

          {/* Price with Floating Placeholder */}
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

          {/* Status Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status Jadwal</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
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
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
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
            <Label htmlFor="notes">Catatan (Opsional)</Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Tambahkan catatan..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
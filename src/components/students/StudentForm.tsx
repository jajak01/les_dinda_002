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
} from '@/components/ui/dialog'
import { UserPlus, User } from 'lucide-react'

interface StudentFormProps {
  student?: any // This will hold the "JAJAK" data
  onSuccess?: () => void
  open: boolean
  setOpen: (open: boolean) => void
}

export default function StudentForm({ student, onSuccess, open, setOpen }: StudentFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    school: '',
    grade: '',
    contact: '',
    address: '',
  })

  // This ensures the data "JAJAK", "sma negeri", etc., loads into the inputs
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        school: student.school || '',
        grade: student.grade || '',
        contact: student.contact || '',
        address: student.address || '',
      })
    } else {
      // Reset form if adding a new student
      setFormData({ name: '', school: '', grade: '', contact: '', address: '' })
    }
  }, [student, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { createStudent, updateStudent } = await import('@/lib/supabase/actions')
      const formDataObj = new FormData()
      
      // Append all data to FormData for the Server Action
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value)
      })

      if (student?.id) {
        await updateStudent(student.id, formDataObj)
      } else {
        await createStudent(formDataObj)
      }

      setOpen(false)
      onSuccess?.()
    } catch (error) {
      console.error('Update failed:', error)
      alert('Gagal menyimpan data')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{student ? 'Edit Siswa' : 'Tambah Siswa Baru'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap *</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="school">Sekolah</Label>
            <Input
              id="school"
              value={formData.school}
              onChange={(e) => setFormData({ ...formData, school: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">Tingkat/Kelas</Label>
            <Input
              id="grade"
              value={formData.grade}
              onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Kontak</Label>
            <Input
              id="contact"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Alamat</Label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
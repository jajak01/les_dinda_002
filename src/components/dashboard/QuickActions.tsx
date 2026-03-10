'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { useState } from 'react'

interface QuickActionsProps {
  onAddStudent: () => void
  onAddSession: () => void
}

export default function QuickActions({ onAddStudent, onAddSession }: QuickActionsProps) {
  const [isStudentOpen, setIsStudentOpen] = useState(false)
  const [isSessionOpen, setIsSessionOpen] = useState(false)

  return (
    <div className="flex gap-4">
      <Dialog open={isStudentOpen} onOpenChange={setIsStudentOpen}>
        <DialogTrigger asChild>
          <Button onClick={onAddStudent}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Siswa
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Siswa Baru</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">Form untuk menambah siswa baru</p>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSessionOpen} onOpenChange={setIsSessionOpen}>
        <DialogTrigger asChild>
          <Button onClick={onAddSession} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Sesi
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Sesi Baru</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600">Form untuk menambah sesi les baru</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

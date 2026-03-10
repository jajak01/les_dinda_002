'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Filter, X } from 'lucide-react'
import { useState } from 'react'

interface SessionFiltersProps {
  onFilterChange: (filters: any) => void
}

export default function SessionFilters({ onFilterChange }: SessionFiltersProps) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [paymentStatus, setPaymentStatus] = useState<string>('all')

  const handleFilterChange = () => {
    onFilterChange({ search, status, paymentStatus })
  }

  const handleReset = () => {
    setSearch('')
    setStatus('all')
    setPaymentStatus('all')
    onFilterChange({ search: '', status: 'all', paymentStatus: 'all' })
  }

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filter Sesi</h3>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <X className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="search">Cari Siswa</Label>
          <Input
            id="search"
            placeholder="Nama atau kontak siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status Jadwal</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="scheduled">Jadwal</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
              <SelectItem value="cancelled">Batal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentStatus">Status Pembayaran</Label>
          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger id="paymentStatus">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Lunas</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleFilterChange} className="w-full">
        <Filter className="mr-2 h-4 w-4" />
        Terapkan Filter
      </Button>
    </div>
  )
}

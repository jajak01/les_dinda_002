'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Edit, Trash2, GraduationCap, Search, X, 
  ArrowUpDown, SortAsc, SortDesc 
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { Student } from '@/types/database'

interface StudentListProps {
  students: Student[]
  onEdit: (student: Student) => void
  onDelete: (id: string) => void
}

export default function StudentList({ students, onEdit, onDelete }: StudentListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'grade'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // 1. Filter Logic
  const filteredStudents = students.filter((student: Student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 2. Sort Logic
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const valA = a[sortBy]?.toString().toLowerCase() || ''
    const valB = b[sortBy]?.toString().toLowerCase() || ''
    
    if (sortOrder === 'asc') return valA > valB ? 1 : -1
    return valA < valB ? 1 : -1
  })

  return (
    <div className="space-y-8">
      {/* Search & Sort Container */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-3 w-full max-w-4xl mx-auto mb-10">
        
        {/* The Wide Search Bar */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <Input
            type="text"
            placeholder="Cari nama siswa..."
            className="pl-12 pr-10 border-slate-200 focus:ring-indigo-500 rounded-2xl h-14 text-lg shadow-sm bg-white transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-14 px-5 rounded-2xl border-slate-200 bg-white flex gap-2 font-semibold text-slate-600 hover:bg-slate-50">
              <ArrowUpDown className="h-4 w-4" />
              {sortBy === 'name' ? 'Nama' : 'Kelas'}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
            <DropdownMenuLabel className="text-xs text-slate-400">Urutkan Berdasarkan</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => setSortBy('name')} className="rounded-lg">Nama</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy('grade')} className="rounded-lg">Kelas</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setSortOrder('asc')} className="flex justify-between items-center rounded-lg">
              A-Z / Terkecil {sortOrder === 'asc' && <SortAsc className="h-4 w-4 text-indigo-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder('desc')} className="flex justify-between items-center rounded-lg">
              Z-A / Terbesar {sortOrder === 'desc' && <SortDesc className="h-4 w-4 text-indigo-600" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Grid Deck */}
      {sortedStudents.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedStudents.map((student: Student) => (
            <Card 
              key={student.id} 
              className="hover:shadow-md transition-all cursor-pointer border-slate-200 bg-white group hover:-translate-y-1"
              onClick={() => router.push(`/students/${student.id}`)}
            >
              <CardContent className="px-6 py-5">
                <div className="flex justify-between items-start gap-2">
                  <div className="space-y-2 ml-1">
                    <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                      {student.name}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500 flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {student.school}
                      </p>
                      <div className="text-xs font-medium text-indigo-600 bg-indigo-50/50 w-fit px-2 py-0.5 rounded border border-indigo-100">
                        Kelas {student.grade}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100" onClick={() => onEdit(student)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-100" onClick={() => onDelete(student.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
          <p className="text-slate-500 font-medium italic">Hasil tidak ditemukan.</p>
        </div>
      )}
    </div>
  )
}
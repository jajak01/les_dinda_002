'use client'

import { useState, useEffect } from 'react'
import StudentList from '@/components/students/StudentList'
import StudentForm from '@/components/students/StudentForm'
import { UserPlus } from 'lucide-react'
import { getStudents } from '@/lib/supabase/actions'
import type { Student } from '@/types/database'

export default function StudentsPage() {
  // FIXED: Changed setSessions to setStudents
  const [students, setStudents] = useState<Student[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getStudents()
      // FIXED: Using setStudents instead of setSessions
      setStudents(data || [])
    } catch (error) {
      console.error("Failed to load students:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleEdit = (student: Student) => {
    setSelectedStudent(student)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
      const { deleteStudent } = await import('@/lib/supabase/actions')
      await deleteStudent(id)
      setStudents(students.filter((s) => s.id !== id))
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manajemen Siswa</h1>
          <p className="text-slate-500">Kelola daftar siswa Les Dinda.</p>
        </div>
        <button 
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2"
          onClick={() => {
            setSelectedStudent(null)
            setIsFormOpen(true)
          }}
        >
          <UserPlus className="h-4 w-4" />
          Tambah Siswa
        </button>
      </div>

      <StudentForm 
        open={isFormOpen} 
        setOpen={setIsFormOpen} 
        student={selectedStudent} 
        onSuccess={() => {
          setIsFormOpen(false)
          loadData()
        }} 
      />

      {loading ? (
        <div className="text-center py-10 text-slate-500">Memuat data siswa...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <StudentList
            students={students}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  )
}
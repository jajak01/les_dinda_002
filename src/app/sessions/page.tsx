'use client'

import { useState, useEffect } from 'react'
import SessionList from '@/components/sessions/SessionList'
import SessionForm from '@/components/sessions/SessionForm'
import SessionFilters from '@/components/sessions/SessionFilters'
import { CalendarPlus } from 'lucide-react'
import { getSessions } from '@/lib/supabase/actions'

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [filters, setFilters] = useState<any>({})
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getSessions(filters)
      setSessions(data || [])
    } catch (error) {
      console.error("Failed to load sessions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filters])

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus sesi ini?')) {
      const { deleteSession } = await import('@/lib/supabase/actions')
      await deleteSession(id)
      loadData()
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Jadwal Sesi</h1>
          <p className="text-slate-500">Atur dan pantau jadwal les privat.</p>
        </div>
        <button 
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2"
          onClick={() => {
            setSelectedSession(null)
            setIsFormOpen(true)
          }}
        >
          <CalendarPlus className="h-4 w-4" />
          Tambah Sesi
        </button>
      </div>

      <SessionForm 
        session={selectedSession} 
        open={isFormOpen}
        setOpen={setIsFormOpen}
        onSuccess={() => {
          setIsFormOpen(false)
          loadData()
        }} 
      />

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <SessionFilters onFilterChange={setFilters} />
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Memuat jadwal...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-4">
          <SessionList
            sessions={sessions}
            onEdit={(session) => {
              setSelectedSession(session)
              setIsFormOpen(true)
            }}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  )
}
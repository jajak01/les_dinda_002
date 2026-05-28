'use client'

import { useState, useEffect, useCallback } from 'react'
import SessionList from '@/components/sessions/SessionList'
import SessionForm from '@/components/sessions/SessionForm'
import SessionFilters from '@/components/sessions/SessionFilters'
import { CalendarPlus, Loader2 } from 'lucide-react'
import { getSessions, deleteSession } from '@/lib/supabase/actions'
import type { Session } from '@/types/database'

interface Filters {
  search?: string
  status?: string
  paymentStatus?: string
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [filters, setFilters] = useState<Filters>({})
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSessions(filters)
      setSessions(data || [])
    } catch (error) {
      console.error("Failed to load sessions:", error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus sesi ini?')) {
      try {
        await deleteSession(id)
        await loadData() 
      } catch (error) {
        alert("Gagal menghapus sesi. Silakan coba lagi.")
        console.error("Delete error:", error)
      }
    }
  }

  const handleEdit = (session: Session) => {
    setSelectedSession(session)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Jadwal Sesi</h1>
          <p className="text-slate-500">Atur dan pantau jadwal les privat Dinda.</p>
        </div>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2 cursor-pointer"
          onClick={() => {
            setSelectedSession(null)
            setIsFormOpen(true)
          }}
        >
          <CalendarPlus className="h-4 w-4" />
          Tambah Sesi
        </button>
      </div>

      {/* Form Modal */}
      <SessionForm 
        session={selectedSession} 
        open={isFormOpen}
        setOpen={setIsFormOpen}
        onSuccess={() => {
          setIsFormOpen(false)
          loadData()
        }} 
      />

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <SessionFilters onFilterChange={setFilters} />
      </div>

      {/* Main Content: Pure List View */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p>Memuat jadwal...</p>
          </div>
        ) : (
          <SessionList
            sessions={sessions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  )
}
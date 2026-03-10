'use client'

import { useState, useEffect, useCallback } from 'react'
import SessionList from '@/components/sessions/SessionList'
import SessionForm from '@/components/sessions/SessionForm'
import SessionFilters from '@/components/sessions/SessionFilters'
import { CalendarPlus, Loader2 } from 'lucide-react'
// Centralizing imports prevents Vercel build refspec errors
import { getSessions, deleteSession } from '@/lib/supabase/actions'

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [filters, setFilters] = useState<any>({})
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Memoizing loadData to prevent unnecessary re-renders
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
        await loadData() // Refresh list after deletion
      } catch (error) {
        alert("Gagal menghapus sesi. Silakan coba lagi.")
        console.error("Delete error:", error)
      }
    }
  }

  const handleEdit = (session: any) => {
    setSelectedSession(session)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Jadwal Sesi</h1>
          <p className="text-slate-500">Atur dan pantau jadwal les privat Dinda.</p>
        </div>
        <button 
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
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

      {/* Main Content: List or Loading State */}
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
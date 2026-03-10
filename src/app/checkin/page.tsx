'use client'

// Make sure this path matches where your DailyCheckIn component actually lives
import DailyCheckIn from '@/components/dashboard/DailyCheckIn'
import { CircleCheck, ClipboardList } from 'lucide-react'

export default function CheckinPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-indigo-600" />
            Laporan Harian
          </h1>
          <p className="text-slate-500 mt-1">Catat kehadiran siswa dan progres sesi les hari ini.</p>
        </div>
        <div className="hidden sm:flex bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 items-center gap-2">
          <CircleCheck className="h-5 w-5 text-emerald-600" />
          <span className="text-emerald-700 font-medium text-sm">Sistem Aktif</span>
        </div>
      </div>

      {/* Main Content Area - Reusing your existing component */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          <DailyCheckIn 
            onSuccess={() => {
              // This triggers when the checkin is successfully submitted
              // You can add a toast notification here later if you want!
              console.log('Check-in berhasil disimpan!')
            }} 
          />
        </div>
      </div>
    </div>
  )
}
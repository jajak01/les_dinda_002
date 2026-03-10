'use client'

import { useState, useEffect } from 'react'
import StatsCards from './StatsCards'
import DailyCheckIn from './DailyCheckIn'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, TrendingUp, Calendar as CalendarIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getDashboardStats } from '@/lib/supabase/actions'

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null)
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadInitialData() {
      setLoading(true)
      const statsData = await getDashboardStats(dateRange)
      setStats(statsData)
      setLoading(false)
    }
    loadInitialData()
  }, [dateRange])

  if (loading) return <div className="p-8 text-center animate-pulse text-slate-500">Updating dashboard...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Modernized Filter Bar */}
      <Card className="border-none shadow-sm bg-indigo-900 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
          <TrendingUp size={200} />
        </div>
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 space-y-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" /> 
                Filter Laporan Pendapatan
              </h2>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label className="text-indigo-200 text-xs">Mulai</Label>
                  <Input 
                    type="date" 
                    className="bg-white/10 border-white/20 text-white"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="flex-1">
                  <Label className="text-indigo-200 text-xs">Sampai</Label>
                  <Input 
                    type="date" 
                    className="bg-white/10 border-white/20 text-white"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <Button variant="secondary" onClick={() => {}} className="w-full md:w-auto">
              <Search className="mr-2 h-4 w-4" /> Update Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Stats Grid */}
      <StatsCards stats={stats} />

      {/* 3. Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* UpcomingSessions removed from here */}
          <DailyCheckIn onSuccess={() => {}} />
        </div>

        <div className="space-y-6">
          <Card className="border-indigo-100 bg-indigo-50/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="p-2 bg-indigo-100 rounded-lg text-indigo-600 font-bold text-sm">💰</span>
                Ringkasan Omzet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-xl shadow-sm border border-indigo-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Omzet</p>
                <p className="text-3xl font-black text-indigo-700">
                  Rp {stats?.total_omzet?.toLocaleString('id-ID') || 0}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex-1 p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">Selesai</p>
                  <p className="font-bold text-emerald-700">Rp {stats?.this_month_revenue?.toLocaleString('id-ID') || 0}</p>
                </div>
                <div className="flex-1 p-3 bg-orange-50 rounded-lg border border-orange-100 text-center">
                  <p className="text-[10px] font-bold text-orange-600 uppercase">Pending</p>
                  <p className="font-bold text-orange-700">Rp {stats?.pending_payments?.toLocaleString('id-ID') || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import StatsCards from './StatsCards'
import DailyCheckIn from './DailyCheckIn'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Search, TrendingUp, Calendar as CalendarIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getDashboardStats } from '@/lib/supabase/actions'
import { format, startOfMonth } from 'date-fns'

// ✅ Strong typing
type Stats = {
  total_students: number
  today_sessions: number
  total_omzet: number
  this_month_revenue: number
  pending_payments: number
}

// ✅ Default stats (no null crash)
const defaultStats: Stats = {
  total_students: 0,
  today_sessions: 0,
  total_omzet: 0,
  this_month_revenue: 0,
  pending_payments: 0,
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>(defaultStats)

  // ✅ Default date range (THIS MONTH → TODAY)
  const today = new Date()
  const firstDay = startOfMonth(today)

  const defaultStart = format(firstDay, 'yyyy-MM-dd')
  const defaultEnd = format(today, 'yyyy-MM-dd')

  // input (user editing)
  const [inputDateRange, setInputDateRange] = useState({
    startDate: defaultStart,
    endDate: defaultEnd,
  })

  // applied (used for fetch)
  const [appliedDateRange, setAppliedDateRange] = useState({
    startDate: defaultStart,
    endDate: defaultEnd,
  })

  const [loading, setLoading] = useState(false)

  // ✅ Fetch ONLY when applied changes
  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setLoading(true)
      try {
        const data = await getDashboardStats(appliedDateRange)

        if (isMounted && data) {
          setStats({
            total_students: data.total_students ?? 0,
            today_sessions: data.today_sessions ?? 0, // ✅ FIX
            total_omzet: data.total_omzet ?? 0,
            this_month_revenue: data.this_month_revenue ?? 0,
            pending_payments: data.pending_payments ?? 0,
          })
        }
      } catch (err) {
        console.error('Dashboard error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [appliedDateRange])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* FILTER */}
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
                    value={inputDateRange.startDate}
                    onChange={(e) =>
                      setInputDateRange((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex-1">
                  <Label className="text-indigo-200 text-xs">Sampai</Label>
                  <Input
                    type="date"
                    className="bg-white/10 border-white/20 text-white"
                    value={inputDateRange.endDate}
                    onChange={(e) =>
                      setInputDateRange((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* BUTTON triggers fetch */}
            <Button
              variant="secondary"
              onClick={() => setAppliedDateRange(inputDateRange)}
              className="w-full md:w-auto"
              disabled={loading}
            >
              <Search className="mr-2 h-4 w-4" />
              {loading ? 'Loading...' : 'Update Data'}
            </Button>
          </div>

          {/* subtle loading */}
          {loading && (
            <p className="text-xs text-indigo-200 mt-2">
              Updating data...
            </p>
          )}
        </CardContent>
      </Card>

      {/* STATS */}
      <StatsCards stats={stats} />

      {/* MAIN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <DailyCheckIn onSuccess={() => {}} />
        </div>

        <div className="space-y-6">
          <Card className="border-indigo-100 bg-indigo-50/30">
            <CardContent className="space-y-4 p-6">

              <div className="p-4 bg-white rounded-xl shadow-sm border border-indigo-100">
                <p className="text-xs font-bold text-slate-400 uppercase">
                  Total Omzet
                </p>
                <p className="text-3xl font-black text-indigo-700">
                  Rp {stats.total_omzet.toLocaleString('id-ID')}
                </p>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 p-3 bg-emerald-50 rounded-lg border text-center">
                  <p className="text-[10px] font-bold text-emerald-600 uppercase">
                    Selesai
                  </p>
                  <p className="font-bold text-emerald-700">
                    Rp {stats.this_month_revenue.toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex-1 p-3 bg-orange-50 rounded-lg border text-center">
                  <p className="text-[10px] font-bold text-orange-600 uppercase">
                    Pending
                  </p>
                  <p className="font-bold text-orange-700">
                    Rp {stats.pending_payments.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, DollarSign, Calendar, Users, AlertCircle } from 'lucide-react'

interface Stats {
  total_students: number
  today_sessions: number
  this_month_revenue: number
  pending_payments: number
}

interface Props {
  stats: Stats
}

export default function StatsCards({ stats }: Props) {
  // Utility to format numbers as Indonesian Rupiah
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Define card configurations
  const cards = [
    {
      title: 'Total Siswa',
      value: stats.total_students,
      icon: Users,
      color: 'text-blue-500',
      isCurrency: false,
    },
    {
      title: 'Sesi Hari Ini',
      value: stats.today_sessions,
      icon: Activity,
      color: 'text-green-500',
      isCurrency: false,
    },
    {
      title: 'Pendapatan Selesai',
      value: stats.this_month_revenue,
      icon: DollarSign,
      color: 'text-emerald-600',
      isCurrency: true,
    },
    {
      title: 'Pendapatan Pending',
      value: stats.pending_payments,
      icon: AlertCircle,
      color: 'text-orange-500', // Changed to orange for "pending" feel
      isCurrency: true,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="hover:shadow-lg transition-all duration-300 border-slate-100 hover:-translate-y-1 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full transition-colors ${card.color.replace('text-', 'bg-')}/10`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">
                {card.isCurrency ? formatCurrency(card.value) : card.value}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
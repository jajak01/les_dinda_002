'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { getSessions } from '@/lib/supabase/actions'
import { useEffect, useState } from 'react'

export default function UpcomingSessions() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const data = await getSessions()
      const today = new Date().toISOString().split('T')[0]
      const upcoming = data.filter(s => s.date >= today && s.status === 'scheduled')
      setSessions(upcoming.slice(0, 5))
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-green-500 hover:bg-green-600">Jadwal</Badge>
      case 'completed':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Selesai</Badge>
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600">Batal</Badge>
    }
  }

  const getPaymentBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'paid':
        return <Badge className="bg-green-500 hover:bg-green-600">Lunas</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
      case 'overdue':
        return <Badge className="bg-red-500 hover:bg-red-600">Overdue</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agenda Mendatang</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Memuat data...</p>
        </CardContent>
      </Card>
    )
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Agenda Mendatang</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Tidak ada sesi mendatang</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agenda Mendatang</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="week" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="week">Minggu Ini</TabsTrigger>
            <TabsTrigger value="month">Bulan Ini</TabsTrigger>
            <TabsTrigger value="all">Semua</TabsTrigger>
          </TabsList>
          <TabsContent value="week" className="space-y-3 mt-4">
            {sessions.slice(0, 3).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center bg-blue-100 p-2 rounded">
                    <span className="text-xs font-medium text-blue-600">{format(new Date(session.date), 'dd MMM')}</span>
                    <Clock className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{session.student?.name}</p>
                    <p className="text-sm text-gray-600">{session.time}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(session.status)}
                  {getPaymentBadge(session.payment_status)}
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="month" className="space-y-3 mt-4">
            {sessions.slice(0, 3).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center bg-blue-100 p-2 rounded">
                    <span className="text-xs font-medium text-blue-600">{format(new Date(session.date), 'dd MMM')}</span>
                    <Clock className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{session.student?.name}</p>
                    <p className="text-sm text-gray-600">{session.time}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(session.status)}
                  {getPaymentBadge(session.payment_status)}
                </div>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="all" className="space-y-3 mt-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center justify-center bg-blue-100 p-2 rounded">
                    <span className="text-xs font-medium text-blue-600">{format(new Date(session.date), 'dd MMM')}</span>
                    <Clock className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{session.student?.name}</p>
                    <p className="text-sm text-gray-600">{session.time}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(session.status)}
                  {getPaymentBadge(session.payment_status)}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

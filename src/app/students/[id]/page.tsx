'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getStudents, getSessions } from '@/lib/supabase/actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft, User, School, Phone, MapPin, 
  StickyNote, BookOpen, Calendar, Edit2, Save, X, 
  Loader2, LayoutDashboard, CheckCircle2, AlertCircle 
} from 'lucide-react'
import StudentForm from '@/components/students/StudentForm'

export default function StudentDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [sessions, setSessions] = useState<any[]>([])
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editNoteValue, setEditNoteValue] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    loadStudentData()
  }, [id])

  async function loadStudentData() {
    setLoading(true)
    const allStudents = await getStudents()
    const currentStudent = allStudents.find((s: any) => s.id === id)
    setStudent(currentStudent)

    const allSessions = await getSessions()
    const studentSessions = allSessions.filter((s: any) => s.student_id === id)
    setSessions(studentSessions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()))
    setLoading(false)
  }

  // --- CALCULATION LOGIC ---
  const totalSesi = sessions.length
  const sesiSelesai = sessions.filter(s => s.status === 'completed').length
  
  const nominalLunas = sessions
    .filter(s => s.payment_status === 'paid')
    .reduce((sum, s) => sum + (Number(s.price) || 0), 0)
    
  const nominalPending = sessions
    .filter(s => s.payment_status === 'pending')
    .reduce((sum, s) => sum + (Number(s.fee) || Number(s.price) || 0), 0)

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleUpdateNote = async (sessionId: string) => {
    setSavingId(sessionId)
    try {
      const { updateSession } = await import('@/lib/supabase/actions')
      const formData = new FormData()
      formData.append('notes', editNoteValue) 
      await updateSession(sessionId, formData)
      setEditingNoteId(null)
      await loadStudentData()
    } catch (error) {
      console.error("Gagal update catatan:", error)
    } finally {
      setSavingId(null)
    }
  }

  if (loading) return <div className="p-10 text-center text-slate-500 animate-pulse text-lg">Memuat profil...</div>
  if (!student) return <div className="p-10 text-center">Siswa tidak ditemukan.</div>

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10 px-4 text-slate-900">
      <div className="px-2">
        <Button variant="ghost" onClick={() => router.back()} className="hover:bg-indigo-50 text-slate-600">
          <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Profile & Stats */}
        <div className="md:col-span-4 space-y-6">
          <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
            <div className="bg-indigo-600 h-24 w-full"></div>
            <CardHeader className="text-center -mt-12 pb-2">
              <div className="w-24 h-24 bg-white border-4 border-white text-indigo-600 rounded-full mx-auto flex items-center justify-center shadow-md mb-4">
                <User size={48} />
              </div>
              <CardTitle className="text-2xl font-bold">{student.name}</CardTitle>
              <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold mt-1">
                Kelas {student.grade}
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6 text-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-3"><School className="h-4 w-4 text-indigo-500 mt-0.5" /> <span>{student.school || '-'}</span></div>
                <div className="flex items-start gap-3"><Phone className="h-4 w-4 text-indigo-500 mt-0.5" /> <span>{student.contact || '-'}</span></div>
                <div className="flex items-start gap-3"><MapPin className="h-4 w-4 text-indigo-500 mt-0.5" /> <span className="leading-relaxed">{student.address || '-'}</span></div>
              </div>
              <Button className="w-full mt-2 bg-indigo-600 text-white" onClick={() => setIsEditOpen(true)}>Edit Profil</Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm bg-slate-50/50">
            <CardHeader className="pb-3 px-4">
              <CardTitle className="text-xs font-bold flex items-center gap-2 text-slate-500 uppercase tracking-widest">
                <LayoutDashboard className="h-4 w-4 text-indigo-500" />
                Ringkasan Laporan
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Total Sesi</p>
                  <p className="text-lg font-black">{totalSesi}</p>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Selesai</p>
                  <p className="text-lg font-black text-emerald-600">{sesiSelesai}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm border-l-4 border-l-emerald-500 col-span-2">
                  <p className="text-[10px] font-bold text-emerald-600/70 uppercase mb-1">Total Lunas</p>
                  <p className="text-xl font-black text-emerald-700">{formatIDR(nominalLunas)}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-sm border-l-4 border-l-rose-500 col-span-2">
                  <p className="text-[10px] font-bold text-rose-600/70 uppercase mb-1">Total Pending</p>
                  <p className="text-xl font-black text-rose-700">{formatIDR(nominalPending)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: History */}
        <div className="md:col-span-8 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <StickyNote className="h-6 w-6 text-indigo-600" />
            Riwayat Catatan Sesi
          </h2>
          
          <div className="space-y-5">
            {sessions.map((session) => {
              const isPaid = session.payment_status === 'paid'
              return (
                <Card key={session.id} className="border-slate-200 shadow-sm overflow-hidden bg-white">
                  <div className="flex items-center justify-between p-4 bg-slate-50/80 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        {new Date(session.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      
                      {/* PAYMENT STATUS BADGE (ADDED BACK) */}
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${
                        isPaid 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {isPaid ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                        {isPaid ? 'Lunas' : 'Pending'}
                      </div>

                      {session.subject && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-bold uppercase tracking-wider">
                          <BookOpen className="h-3 w-3" />
                          {session.subject}
                        </div>
                      )}
                    </div>
                    
                    {editingNoteId !== session.id && (
                      <Button variant="ghost" size="sm" className="h-8 text-indigo-600 rounded-full" onClick={() => { setEditingNoteId(session.id); setEditNoteValue(session.notes || '') }}>
                        <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                      </Button>
                    )}
                  </div>

                  <CardContent className="p-5 text-sm">
                    {editingNoteId === session.id ? (
                      <div className="space-y-3">
                        <textarea
                          className="w-full min-h-[100px] p-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                          value={editNoteValue}
                          onChange={(e) => setEditNoteValue(e.target.value)}
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingNoteId(null)}>Batal</Button>
                          <Button size="sm" className="bg-indigo-600 text-white" onClick={() => handleUpdateNote(session.id)} disabled={savingId === session.id}>
                            {savingId === session.id ? <Loader2 className="animate-spin h-4 w-4" /> : 'Simpan'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {session.notes || <span className="text-slate-400 italic">Tidak ada catatan.</span>}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      <StudentForm open={isEditOpen} setOpen={setIsEditOpen} student={student} onSuccess={() => loadData()} />
    </div>
  )
}
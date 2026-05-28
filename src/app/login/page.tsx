'use client'

import { useActionState } from 'react'
import { loginUser } from '@/lib/supabase/authActions'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GraduationCap, Lock, User, AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginUser, null)

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Background abstract graphics for premium feel */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse duration-10000"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse duration-7000"></div>

      <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
          {/* Top Gradient Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-8 text-center relative">
            <div className="mx-auto w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/20 mb-4 transform hover:scale-105 transition-transform duration-300">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-black tracking-tight text-white">Les CerdasIND DEMO</CardTitle>
            <CardDescription className="text-indigo-100 mt-1.5 font-medium">Aplikasi Pelacakan Les Privat</CardDescription>
          </div>

          <CardContent className="p-8">
            <form action={formAction} className="space-y-6">
              {state?.error && (
                <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm animate-shake">
                  <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <p className="font-semibold">{state.error}</p>
                </div>
              )}

              {/* Username Input */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-700 font-bold text-sm">Username</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="Masukkan username admin"
                    className="pl-10 h-11 border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-slate-700 font-bold text-sm">Password</Label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="pl-10 h-11 border-slate-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 hover:shadow-indigo-200 hover:-translate-y-0.5 transition-all duration-300"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memeriksa Kredensial...
                  </>
                ) : (
                  'Masuk sebagai Admin'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

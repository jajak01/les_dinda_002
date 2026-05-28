'use server'

import { supabaseServer } from './server'
import { createSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export async function loginUser(prevState: any, formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { error: 'Username dan Password wajib diisi!' }
  }

  try {
    const { data, error } = await supabaseServer.rpc('authenticate_user', {
      p_username: username.trim(),
      p_password: password
    })

    if (error) {
      console.error('Auth RPC Error:', error)
      return { error: 'Terjadi kesalahan sistem saat masuk.' }
    }

    if (!data || data.length === 0 || !data[0].authenticated) {
      return { error: 'Username atau Password salah!' }
    }

    const user = data[0]
    if (user.role !== 'admin') {
      return { error: 'Akses ditolak! Hanya Admin yang dapat masuk.' }
    }

    await createSession(user.id, user.username, user.role)
  } catch (err: any) {
    console.error('Login action error:', err)
    return { error: err.message || 'Gagal masuk.' }
  }

  // Redirect after setting cookie (must be outside try-catch to work correctly in Next.js)
  redirect('/')
}

export async function logoutUser() {
  await deleteSession()
  redirect('/login')
}

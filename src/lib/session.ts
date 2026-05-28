import { cookies } from 'next/headers'

const SECRET_KEY = process.env.SESSION_SECRET || 'fallback_secret_key_les_dinda_secure_random_string_987654321'

async function getCryptoKey() {
  const encoder = new TextEncoder()
  return await crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET_KEY),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

export async function signPayload(payload: string): Promise<string> {
  const key = await getCryptoKey()
  const encoder = new TextEncoder()
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  )
  const signatureArray = Array.from(new Uint8Array(signatureBuffer))
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return `${payload}.${signatureHex}`
}

export async function verifySignature(token: string): Promise<string | null> {
  const parts = token.split('.')
  if (parts.length < 2) return null
  const signatureHex = parts.pop()!
  const payload = parts.join('.')

  const key = await getCryptoKey()
  const encoder = new TextEncoder()
  const validSignatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  )
  const validSignatureArray = Array.from(new Uint8Array(validSignatureBuffer))
  const validSignatureHex = validSignatureArray.map(b => b.toString(16).padStart(2, '0')).join('')

  if (signatureHex === validSignatureHex) {
    return payload
  }
  return null
}

export interface SessionData {
  userId: string
  username: string
  role: string
  expires: number
}

export async function createSession(userId: string, username: string, role: string) {
  const expires = Date.now() + 24 * 60 * 60 * 1000 // 1 day
  const payload = JSON.stringify({ userId, username, role, expires })
  const token = await signPayload(payload)
  
  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(expires),
    sameSite: 'lax',
    path: '/'
  })
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const cookie = cookieStore.get('session')
  if (!cookie?.value) return null
  
  const payloadStr = await verifySignature(cookie.value)
  if (!payloadStr) return null
  
  try {
    const session = JSON.parse(payloadStr) as SessionData
    if (session.expires < Date.now()) {
      return null // Expired
    }
    return session
  } catch {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

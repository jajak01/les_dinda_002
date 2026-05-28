import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

async function verifyToken(token: string): Promise<any | null> {
  const parts = token.split('.')
  if (parts.length < 2) return null
  const signatureHex = parts.pop()!
  const payload = parts.join('.')

  try {
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
      const data = JSON.parse(payload)
      if (data.expires > Date.now()) {
        return data
      }
    }
  } catch (err) {
    console.error('Middleware token verify error:', err)
  }
  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get('session')?.value
  const session = sessionCookie ? await verifyToken(sessionCookie) : null

  const isLoginPage = pathname === '/login'

  if (!session && !isLoginPage) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (session && isLoginPage) {
    const dashboardUrl = new URL('/', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

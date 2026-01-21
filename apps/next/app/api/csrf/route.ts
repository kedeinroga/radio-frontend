import { NextResponse } from 'next/server'

/**
 * GET /api/csrf
 * 
 * Genera y devuelve un token CSRF para el cliente.
 * El token se almacena en una cookie httpOnly y también se devuelve
 * en el response para que el cliente pueda usarlo.
 * 
 * Uso en el cliente:
 * ```typescript
 * const response = await fetch('/api/csrf')
 * const { csrfToken } = await response.json()
 * // El token también está en las cookies
 * ```
 */
export async function GET() {
  const token = generateCSRFToken()
  
  const response = NextResponse.json({ 
    csrfToken: token,
    message: 'CSRF token generated successfully'
  })
  
  // Establecer cookie httpOnly
  response.cookies.set('csrf_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 3600, // 1 hora
  })
  
  return response
}

/**
 * Genera un token CSRF seguro
 */
function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    globalThis.crypto.getRandomValues(array)
  } else {
    // Fallback
    const crypto = require('crypto')
    const buffer = crypto.randomBytes(32)
    array.set(buffer)
  }
  
  const base64 = Buffer.from(array).toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

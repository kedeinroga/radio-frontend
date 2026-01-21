import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * CSRF Validation Middleware for API Routes
 * 
 * Valida que las requests POST/PUT/DELETE incluyan un token CSRF válido.
 * 
 * Uso en API routes:
 * ```typescript
 * import { validateCSRF } from '@/lib/csrfValidation'
 * 
 * export async function POST(request: NextRequest) {
 *   const csrfValidation = validateCSRF(request)
 *   if (!csrfValidation.valid) {
 *     return csrfValidation.response
 *   }
 *   
 *   // Continue with request handling...
 * }
 * ```
 */
export async function validateCSRF(request: NextRequest): Promise<{
  valid: boolean
  response?: NextResponse
}> {
  // Solo validar métodos que modifican datos
  const method = request.method
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return { valid: true }
  }
  
  // Obtener token del header
  const tokenFromHeader = request.headers.get('X-CSRF-Token') || 
                          request.headers.get('x-csrf-token')
  
  // Obtener token de la cookie
  const cookieStore = await cookies()
  const tokenFromCookie = cookieStore.get('csrf_token')?.value
  
  // Validar que ambos existan
  if (!tokenFromHeader || !tokenFromCookie) {
    return {
      valid: false,
      response: NextResponse.json(
        { 
          error: 'CSRF token missing',
          code: 'CSRF_TOKEN_MISSING',
          message: 'Request must include a valid CSRF token'
        },
        { status: 403 }
      )
    }
  }
  
  // Validar que coincidan (constant-time comparison)
  if (!constantTimeCompare(tokenFromHeader, tokenFromCookie)) {
    return {
      valid: false,
      response: NextResponse.json(
        { 
          error: 'CSRF token invalid',
          code: 'CSRF_TOKEN_INVALID',
          message: 'CSRF token does not match'
        },
        { status: 403 }
      )
    }
  }
  
  return { valid: true }
}

/**
 * Comparación de strings en tiempo constante (server-side)
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * Genera un nuevo token CSRF y lo almacena en una cookie httpOnly
 * 
 * Uso en API routes:
 * ```typescript
 * export async function GET() {
 *   const response = NextResponse.json({ success: true })
 *   setCSRFCookie(response)
 *   return response
 * }
 * ```
 */
export function setCSRFCookie(response: NextResponse): NextResponse {
  // Generar token seguro
  const token = generateSecureToken()
  
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
 * Genera un token seguro usando crypto (server-side)
 */
function generateSecureToken(): string {
  // En Node.js 19+, crypto está disponible globalmente
  const array = new Uint8Array(32)
  
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    globalThis.crypto.getRandomValues(array)
  } else {
    // Fallback para versiones antiguas de Node
    const crypto = require('crypto')
    const buffer = crypto.randomBytes(32)
    array.set(buffer)
  }
  
  // Convertir a base64 URL-safe
  const base64 = Buffer.from(array).toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * Helper para crear una respuesta con CSRF token incluido
 */
export function createResponseWithCSRF<T>(data: T): NextResponse<T> {
  const response = NextResponse.json(data)
  setCSRFCookie(response)
  return response
}

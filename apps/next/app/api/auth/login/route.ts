import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient, BackendError } from '@/lib/api/backendClient'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

/** Decode JWT payload without verifying signature (claims are verified by the backend). */
function decodeJwt(token: string): Record<string, any> | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const json = Buffer.from(part, 'base64url').toString('utf-8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

/**
 * POST /api/auth/login
 * 
 * Proxy para login de usuario.
 * ✅ Recibe credentials del cliente
 * ✅ Proxy al backend
 * ✅ Retorna tokens como cookies HttpOnly (seguro)
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = rateLimit(request, RATE_LIMITS.AUTH)
  if (rateLimitResult) {
    return rateLimitResult
  }

  try {
    const { email, password } = await request.json()

    // 1. ✅ Llamar al backend usando backendHttpClient
    const data = await backendHttpClient.post<{
      access_token: string
      refresh_token: string
      session_id: string
      expires_in: number
      jti: string
    }>('/auth/login', { email, password })

    // Extraer tokens
    const { access_token, refresh_token, session_id, expires_in, jti } = data

    if (!access_token || !refresh_token) {
      return NextResponse.json(
        { error: { code: 'invalid_response', message: 'Missing authentication tokens.' } },
        { status: 500 }
      )
    }

    // 2. Extraer datos del usuario directamente del JWT.
    //    El token ya contiene id, email y role en su payload — no hace falta llamar a /auth/me.
    const jwtPayload = decodeJwt(access_token)
    if (!jwtPayload) {
      console.error('[auth/login] Could not decode JWT payload')
      return NextResponse.json(
        { error: { code: 'invalid_token', message: 'Could not decode authentication token.' } },
        { status: 500 }
      )
    }

    const mappedUser = {
      id: jwtPayload.sub || jwtPayload.id,
      email: jwtPayload.email,
      role: jwtPayload.user_type || jwtPayload.role,
    }

    // 3. Crear response con cookies HttpOnly
    const nextResponse = NextResponse.json({
      success: true,
      session_id,
      expires_in,
      jti,
      user: mappedUser,
    })

    // 4. Configurar cookies seguras
    nextResponse.cookies.set('@radio-app:access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
    })

    nextResponse.cookies.set('@radio-app:refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 días
      path: '/',
    })

    return nextResponse
  } catch (error: unknown) {
    const isDev = process.env.NODE_ENV === 'development'
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Login error:', message)

    if (error instanceof BackendError) {
      if (error.isUnauthorized) {
        // 401 del backend = credenciales incorrectas — mensaje seguro para el cliente
        return NextResponse.json(
          { error: { code: 'invalid_credentials', message: 'Invalid email or password.' } },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      {
        error: {
          code: 'server_error',
          // En dev: mensaje detallado. En producción: mensaje genérico
          message: isDev ? message : 'An unexpected error occurred. Please try again.',
        },
      },
      { status: 500 }
    )
  }
}

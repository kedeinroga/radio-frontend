import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient } from '@/lib/api/backendClient'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

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
    const data = await backendHttpClient.post('/auth/login', {
      email,
      password,
    })

    // Extraer tokens
    const { access_token, refresh_token, session_id, expires_in, jti } = data

    if (!access_token || !refresh_token) {
      return NextResponse.json(
        {
          error: {
            code: 'invalid_response',
            message: 'Missing authentication tokens',
          },
        },
        { status: 500 }
      )
    }

    // 2. ✅ Obtener información del usuario
    const userInfo = await backendHttpClient.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    // Extraer y mapear datos del usuario
    const user = userInfo.user || userInfo
    const mappedUser = {
      id: user.id,
      email: user.email,
      role: user.user_type || user.role, // user_type del backend se mapea a role
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
  } catch (error: any) {
    console.error('Login error:', error)

    return NextResponse.json(
      {
        error: {
          code: 'server_error',
          message: error.message || 'Internal server error'
        }
      },
      { status: error.status || 500 }
    )
  }
}

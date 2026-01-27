import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient } from '@/lib/api/backendClient'

/**
 * POST /api/auth/refresh
 * 
 * Proxy para refresh de tokens.
 * ✅ Lee refresh_token de cookies HttpOnly
 * ✅ Proxy al backend
 * ✅ Retorna nuevo access_token como cookie
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener refresh_token de cookies HttpOnly
    const refreshToken = request.cookies.get('@radio-app:refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token found' },
        { status: 401 }
      )
    }

    // ✅ Proxy al backend usando backendHttpClient
    const data = await backendHttpClient.post('/auth/refresh', {
      refresh_token: refreshToken,
    })

    const { access_token } = data

    if (!access_token) {
      return NextResponse.json(
        { error: 'Invalid refresh response' },
        { status: 500 }
      )
    }

    // Crear response con nuevo access_token
    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
    })

    // Actualizar access_token cookie
    response.cookies.set('@radio-app:access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/',
    })

    return response
  } catch (error: any) {
    console.error('Token refresh error:', error)

    // Si el refresh falla, limpiar cookies
    const response = NextResponse.json(
      {
        error: 'Failed to refresh token',
        message: error.message,
      },
      { status: error.status || 401 }
    )

    // Limpiar cookies
    response.cookies.delete('@radio-app:access_token')
    response.cookies.delete('@radio-app:refresh_token')

    return response
  }
}

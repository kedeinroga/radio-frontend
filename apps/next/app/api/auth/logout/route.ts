import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient } from '@/lib/api/backendClient'

/**
 * POST /api/auth/logout
 * 
 * Proxy para logout de usuario.
 * ✅ Invalida sesión en backend
 * ✅ Limpia cookies HttpOnly
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('@radio-app:access_token')?.value

    // Intentar invalidar sesión en backend si hay token
    if (accessToken) {
      try {
        await backendHttpClient.post('/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      } catch (error) {
        // Continuar aunque falle el logout en backend
        console.error('Backend logout failed:', error)
      }
    }

    // Limpiar cookies HttpOnly
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })

    response.cookies.delete('@radio-app:access_token')
    response.cookies.delete('@radio-app:refresh_token')

    return response
  } catch (error: any) {
    console.error('Logout error:', error)

    // Siempre limpiar cookies aunque haya error
    const response = NextResponse.json(
      {
        error: 'Logout failed',
        message: error.message,
      },
      { status: 500 }
    )

    response.cookies.delete('@radio-app:access_token')
    response.cookies.delete('@radio-app:refresh_token')

    return response
  }
}

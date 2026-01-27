import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient } from '@/lib/api/backendClient'

/**
 * GET /api/auth/me
 * 
 * Proxy para obtener información del usuario autenticado.
 * ✅ Usa token de cookies HttpOnly
 * ✅ Proxy al backend
 */
export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('@radio-app:access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // ✅ Proxy al backend con authorization
    const data = await backendHttpClient.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Failed to get user info:', error)

    return NextResponse.json(
      {
        error: 'Failed to get user info',
        message: error.message,
      },
      { status: error.status || 500 }
    )
  }
}

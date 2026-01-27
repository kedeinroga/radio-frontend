import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient } from '@/lib/api/backendClient'

/**
 * GET /api/admin/seo/stats
 * 
 * Proxy para obtener estadísticas SEO.
 * ✅ Requiere autenticación admin
 * ✅ Proxy al backend
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener access token de cookies
    const accessToken = request.cookies.get('@radio-app:access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // ✅ Proxy al backend con authorization header
    const data = await backendHttpClient.get('/admin/seo/stats', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Failed to fetch SEO stats:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch SEO stats',
        message: error.message,
      },
      { status: error.status || 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient } from '@/lib/api/backendClient'

/**
 * POST /api/stream/start
 * Proxy a /stream/start del backend.
 *
 * - Autenticado: reenvía Authorization: Bearer + omite X-Rradio-Secret
 * - Guest:       usa X-Rradio-Secret (sin token de usuario)
 *
 * Body: { station_id: string, ad_id: string | null }
 * Response: { stream_url: string, session_id: string | null, expires_at: string | null }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const accessToken = request.cookies.get('@radio-app:access_token')?.value

    const options = accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` }, skipSecret: true as const }
      : {}

    const data = await backendHttpClient.post('/stream/start', body, options)
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Stream start error:', error)
    return NextResponse.json(
      { error: 'Failed to start stream', message: error.message },
      { status: error.status || 500 }
    )
  }
}

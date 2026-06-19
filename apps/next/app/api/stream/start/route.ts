import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient } from '@/lib/api/backendClient'

/**
 * POST /api/stream/start
 * Proxy a /stream/start del backend.
 *
 * - Autenticado: reenvía Authorization: Bearer + X-Rradio-Secret
 * - Guest:       usa solo X-Rradio-Secret (sin token de usuario)
 *
 * Body: { station_id: string, ad_id: string | null }
 * Response: { stream_url: string, session_id: string | null, expires_at: string | null }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const accessToken = request.cookies.get('@radio-app:access_token')?.value

    const options = accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : {}

    const data = await backendHttpClient.post('/stream/start', body, options)

    // El backend devuelve una URL de proxy RELATIVA (p.ej. "/api/v1/stream/proxy?token=...").
    // El <audio> la resolvería contra el dominio del front (www.rradio.online) → 404, porque esa
    // ruta solo existe en el backend. La convertimos a absoluta apuntando al backend para que el
    // audio se reproduzca directo desde ahí (el endpoint /stream/proxy es no-auth, valida por token).
    // Las URLs directas (caso guest) ya son absolutas (http...), así que no se tocan.
    const streamUrl = (data as { stream_url?: string } | null)?.stream_url
    if (streamUrl?.startsWith('/') && process.env.API_URL) {
      try {
        const backendOrigin = new URL(process.env.API_URL).origin
        ;(data as { stream_url: string }).stream_url = `${backendOrigin}${streamUrl}`
      } catch {
        // API_URL malformada: dejar la URL tal cual (no empeora el comportamiento actual).
      }
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Stream start error:', error)
    return NextResponse.json(
      { error: 'Failed to start stream', message: error.message },
      { status: error.status || 500 }
    )
  }
}

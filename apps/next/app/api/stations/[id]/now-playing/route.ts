import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient, BackendError } from '@/lib/api/backendClient'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

/**
 * GET /api/stations/[id]/now-playing
 *
 * Proxy al backend real para obtener la pista que suena actualmente.
 * El cliente nunca ve el backend URL ni la clave secreta.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const rateLimitResult = rateLimit(request, RATE_LIMITS.API)
  if (rateLimitResult) return rateLimitResult

  try {
    const { id } = await Promise.resolve(params)
    if (!id) {
      return NextResponse.json({ error: 'Station ID is required.' }, { status: 400 })
    }

    // El backend responde 204 (-> undefined) cuando no hay datos.
    const data = await backendHttpClient.get(`/stations/${encodeURIComponent(id)}/now-playing`)
    if (!data) {
      return new NextResponse(null, { status: 204 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    if (error instanceof BackendError) {
      if (error.isUnauthorized) {
        console.error('[GET /api/stations/[id]/now-playing] Backend rejected X-Rradio-Secret (401).')
        return NextResponse.json(
          { error: 'Service temporarily unavailable. Please try again later.' },
          { status: 503 }
        )
      }
      if (error.isServerError) {
        return NextResponse.json(
          { error: 'The radio service is experiencing issues. Please try again later.' },
          { status: 502 }
        )
      }
      return NextResponse.json({ error: 'Failed to fetch now-playing.' }, { status: error.status })
    }

    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[GET /api/stations/[id]/now-playing] Unexpected error:', message)
    return NextResponse.json({ error: 'Failed to fetch now-playing.' }, { status: 500 })
  }
}

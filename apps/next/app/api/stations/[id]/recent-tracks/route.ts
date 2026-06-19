import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient, BackendError } from '@/lib/api/backendClient'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'
import { assertSameOrigin } from '@/lib/api/assertSameOrigin'

/**
 * GET /api/stations/[id]/recent-tracks?limit=10
 *
 * Proxy al backend real para obtener el historial reciente de pistas.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const originResult = assertSameOrigin(request)
  if (originResult) return originResult

  const rateLimitResult = rateLimit(request, RATE_LIMITS.API)
  if (rateLimitResult) return rateLimitResult

  try {
    const { id } = await Promise.resolve(params)
    if (!id) {
      return NextResponse.json({ error: 'Station ID is required.' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const rawLimit = parseInt(searchParams.get('limit') ?? '10', 10)
    const limit = isNaN(rawLimit) || rawLimit < 1 || rawLimit > 50 ? 10 : rawLimit

    const data = await backendHttpClient.get(
      `/stations/${encodeURIComponent(id)}/recent-tracks?limit=${limit}`
    )

    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    if (error instanceof BackendError) {
      if (error.isUnauthorized) {
        console.error('[GET /api/stations/[id]/recent-tracks] Backend rejected X-Rradio-Secret (401).')
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
      return NextResponse.json({ error: 'Failed to fetch recent tracks.' }, { status: error.status })
    }

    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[GET /api/stations/[id]/recent-tracks] Unexpected error:', message)
    return NextResponse.json({ error: 'Failed to fetch recent tracks.' }, { status: 500 })
  }
}

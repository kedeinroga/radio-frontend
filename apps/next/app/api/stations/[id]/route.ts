import { NextRequest, NextResponse } from 'next/server'
import { getStationById } from '@/lib/radioBrowser/client'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'
import { assertSameOrigin } from '@/lib/api/assertSameOrigin'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * GET /api/stations/[id]
 *
 * Detalle de una estación por UUID desde Radio Browser.
 * Responde { data: Station } (404 si no existe o no tiene stream https).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const originResult = assertSameOrigin(request)
  if (originResult) return originResult

  const rateLimitResult = rateLimit(request, RATE_LIMITS.API)
  if (rateLimitResult) return rateLimitResult

  const { id } = await Promise.resolve(params)
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ error: 'Invalid station ID.' }, { status: 400 })
  }

  try {
    const station = await getStationById(id)
    if (!station) {
      return NextResponse.json({ error: 'Station not found.' }, { status: 404 })
    }
    return NextResponse.json({ data: station }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[GET /api/stations/[id]] Radio Browser error:', message)
    return NextResponse.json(
      { error: 'The radio service is experiencing issues. Please try again later.' },
      { status: 502 }
    )
  }
}

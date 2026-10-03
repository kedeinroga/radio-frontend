import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'
import { assertSameOrigin } from '@/lib/api/assertSameOrigin'

/**
 * GET /api/stations/[id]/recent-tracks
 *
 * El historial de pistas lo guardaba el backend (metadata ICY). Sin backend no hay datos:
 * se responde una lista vacía con la misma forma que antes.
 */
export async function GET(request: NextRequest) {
  const originResult = assertSameOrigin(request)
  if (originResult) return originResult

  const rateLimitResult = rateLimit(request, RATE_LIMITS.API)
  if (rateLimitResult) return rateLimitResult

  return NextResponse.json({ data: [] }, { status: 200 })
}

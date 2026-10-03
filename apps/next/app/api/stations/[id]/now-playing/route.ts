import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'
import { assertSameOrigin } from '@/lib/api/assertSameOrigin'

/**
 * GET /api/stations/[id]/now-playing
 *
 * Sin backend ya no hay lectura de metadata ICY, así que no hay dato de "sonando ahora".
 * Se responde 204 (el cliente lo trata como "sin datos" y oculta el widget).
 * Reimplementable más adelante con un Worker que lea los primeros KB del stream.
 */
export async function GET(request: NextRequest) {
  const originResult = assertSameOrigin(request)
  if (originResult) return originResult

  const rateLimitResult = rateLimit(request, RATE_LIMITS.API)
  if (rateLimitResult) return rateLimitResult

  return new NextResponse(null, { status: 204 })
}

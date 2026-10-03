import { NextRequest, NextResponse } from 'next/server'
import { getPopularStations } from '@/lib/radioBrowser/client'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'
import { assertSameOrigin } from '@/lib/api/assertSameOrigin'

/**
 * GET /api/stations/popular
 *
 * Estaciones populares desde Radio Browser (consulta server-side, cacheada 1h).
 * ✅ El cliente llama a /api/stations/popular
 * ✅ Rate limiting aplicado
 * ✅ Input validation en parámetros
 */
export async function GET(request: NextRequest) {
  // 🔒 Solo peticiones del propio sitio (anti-scraping, defensa en profundidad)
  const originResult = assertSameOrigin(request)
  if (originResult) return originResult

  // 🔒 Rate limiting
  const rateLimitResult = rateLimit(request, RATE_LIMITS.API)
  if (rateLimitResult) return rateLimitResult

  try {
    const { searchParams } = new URL(request.url)

    // 🔒 Validar y sanitizar limit (1–100, default 20)
    const rawLimit = parseInt(searchParams.get('limit') ?? '20', 10)
    const limit = isNaN(rawLimit) || rawLimit < 1 || rawLimit > 100 ? 20 : rawLimit

    const country = searchParams.get('country')
    const data = await getPopularStations(limit, country || undefined)

    return NextResponse.json({ data, meta: { total: data.length } }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[GET /api/stations/popular] Radio Browser error:', message)
    return NextResponse.json(
      { error: 'The radio service is experiencing issues. Please try again later.' },
      { status: 502 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { searchStationsByName } from '@/lib/radioBrowser/client'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'
import { assertSameOrigin } from '@/lib/api/assertSameOrigin'

/**
 * GET /api/stations/search
 *
 * Búsqueda de estaciones por nombre en Radio Browser (server-side, cacheada 1h).
 * ✅ Cliente llama a /api/stations/search?q=...
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
    const query = searchParams.get('q')

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    // 🔒 Limitar longitud de la query (previene payloads gigantes)
    if (query.length > 200) {
      return NextResponse.json(
        { error: 'Query parameter "q" must not exceed 200 characters' },
        { status: 400 }
      )
    }

    // 🔒 Validar y sanitizar limit (1–100, default 20)
    const rawLimit = parseInt(searchParams.get('limit') ?? '20', 10)
    const limit = isNaN(rawLimit) || rawLimit < 1 || rawLimit > 100 ? 20 : rawLimit

    const data = await searchStationsByName(query.trim(), limit)

    return NextResponse.json({ data, meta: { total: data.length } }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[GET /api/stations/search] Radio Browser error:', message)
    return NextResponse.json(
      { error: 'Search service is experiencing issues. Please try again later.' },
      { status: 502 }
    )
  }
}

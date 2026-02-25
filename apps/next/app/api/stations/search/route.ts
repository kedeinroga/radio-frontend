import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient, BackendError } from '@/lib/api/backendClient'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

/**
 * GET /api/stations/search
 *
 * Proxy para búsqueda de estaciones.
 * ✅ Cliente llama a /api/stations/search?q=...
 * ✅ Proxy al backend (URL oculto)
 * ✅ Rate limiting aplicado
 * ✅ Input validation en parámetros
 */
export async function GET(request: NextRequest) {
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

    const lang = searchParams.get('lang') || 'es'

    // Construir query string para backend
    const backendQuery = `/stations/search?q=${encodeURIComponent(query.trim())}&limit=${limit}&lang=${lang}`

    // ✅ Proxy usando backendHttpClient
    const data = await backendHttpClient.get(backendQuery, {
      timeout: 60000, // 60s para búsquedas
    })

    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    if (error instanceof BackendError) {
      if (error.isUnauthorized) {
        console.error('[GET /api/stations/search] Backend rejected X-Rradio-Secret (401).')
        return NextResponse.json(
          { error: 'Service temporarily unavailable. Please try again later.' },
          { status: 503 }
        )
      }
      if (error.isServerError) {
        console.error(`[GET /api/stations/search] Backend server error (${error.status}).`)
        return NextResponse.json(
          { error: 'Search service is experiencing issues. Please try again later.' },
          { status: 502 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to search stations.' },
        { status: error.status }
      )
    }

    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[GET /api/stations/search] Unexpected error:', message)
    return NextResponse.json(
      { error: 'Failed to search stations.' },
      { status: 500 }
    )
  }
}

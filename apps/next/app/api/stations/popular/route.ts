import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient, BackendError } from '@/lib/api/backendClient'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'
import { assertSameOrigin } from '@/lib/api/assertSameOrigin'

/**
 * GET /api/stations/popular
 *
 * API Route que hace proxy al backend real.
 * ✅ El cliente llama a /api/stations/popular
 * ✅ Este route hace proxy al backend (oculto del cliente)
 * ✅ El backend URL y la API_SECRET_KEY solo existen en process.env (server-side)
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
    const lang = searchParams.get('lang') || 'es'

    // Construir query string para el backend
    let query = `/stations/popular?limit=${limit}&lang=${lang}`
    if (country) {
      query += `&country=${encodeURIComponent(country)}`
    }

    // ✅ Proxy al backend usando backendHttpClient
    // El cliente NUNCA ve el backend URL real ni la clave secreta
    const data = await backendHttpClient.get(query)

    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    if (error instanceof BackendError) {
      if (error.isUnauthorized) {
        console.error('[GET /api/stations/popular] Backend rejected X-Rradio-Secret (401).')
        return NextResponse.json(
          { error: 'Service temporarily unavailable. Please try again later.' },
          { status: 503 }
        )
      }
      if (error.isServerError) {
        console.error(`[GET /api/stations/popular] Backend server error (${error.status}).`)
        return NextResponse.json(
          { error: 'The radio service is experiencing issues. Please try again later.' },
          { status: 502 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to fetch popular stations.' },
        { status: error.status }
      )
    }

    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[GET /api/stations/popular] Unexpected error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch popular stations.' },
      { status: 500 }
    )
  }
}

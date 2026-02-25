import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient, BackendError } from '@/lib/api/backendClient'

/**
 * GET /api/stations/popular
 *
 * API Route que hace proxy al backend real.
 * ✅ El cliente llama a /api/stations/popular
 * ✅ Este route hace proxy al backend (oculto del cliente)
 * ✅ El backend URL y la API_SECRET_KEY solo existen en process.env (server-side)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '20'
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
      // 401 — La clave secreta fue rechazada o está desactualizada.
      if (error.isUnauthorized) {
        console.error('[GET /api/stations/popular] Backend rejected X-Rradio-Secret (401).')
        return NextResponse.json(
          { error: 'Service temporarily unavailable. Please try again later.' },
          { status: 503 } // No exponer al cliente que es un 401 de auth interna
        )
      }

      // 5xx — Error interno del backend.
      if (error.isServerError) {
        console.error(`[GET /api/stations/popular] Backend server error (${error.status}).`)
        return NextResponse.json(
          { error: 'The radio service is experiencing issues. Please try again later.' },
          { status: 502 } // Bad Gateway — el servidor upstream falló
        )
      }

      // Otros errores HTTP del backend (4xx genérico).
      return NextResponse.json(
        { error: 'Failed to fetch popular stations.', status: error.status },
        { status: error.status }
      )
    }

    // Error de red, timeout, etc.
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[GET /api/stations/popular] Unexpected error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch popular stations.' },
      { status: 500 }
    )
  }
}


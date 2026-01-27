import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient } from '@/lib/api/backendClient'

/**
 * GET /api/stations/popular
 * 
 * API Route que hace proxy al backend real.
 * ✅ El cliente llama a /api/stations/popular
 * ✅ Este route hace proxy al backend (oculto del cliente)
 * ✅ El backend URL solo existe en process.env.API_URL (server-side)
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
    // El cliente NUNCA ve el backend URL real
    const data = await backendHttpClient.get(query)

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Failed to fetch popular stations:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch popular stations',
        message: error.message
      },
      { status: error.status || 500 }
    )
  }
}

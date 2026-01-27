import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient } from '@/lib/api/backendClient'

/**
 * GET /api/stations/search
 * 
 * Proxy para búsqueda de estaciones.
 * ✅ Cliente llama a /api/stations/search?q=...
 * ✅ Proxy al backend (URL oculto)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const limit = searchParams.get('limit') || '20'
    const lang = searchParams.get('lang') || 'es'

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    // Construir query string para backend
    const backendQuery = `/stations/search?q=${encodeURIComponent(query)}&limit=${limit}&lang=${lang}`

    // ✅ Proxy usando backendHttpClient
    const data = await backendHttpClient.get(backendQuery, {
      timeout: 60000, // 60s para búsquedas
    })

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Failed to search stations:', error)

    return NextResponse.json(
      {
        error: 'Failed to search stations',
        message: error.message,
      },
      { status: error.status || 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

/**
 * GET /api/stations/popular
 * Proxy to backend: GET /api/v1/stations/popular
 * Public endpoint - no authentication required
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit') || '20'
    const country = searchParams.get('country')
    const lang = searchParams.get('lang') || 'es'

    // Build backend URL with query parameters
    let backendUrl = `${BACKEND_URL}/stations/popular?limit=${limit}&lang=${lang}`
    if (country) {
      backendUrl += `&country=${encodeURIComponent(country)}`
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Stations Popular] Backend error:', response.status, errorText)
      
      return NextResponse.json(
        { error: 'Failed to get popular stations', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('[Stations Popular] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

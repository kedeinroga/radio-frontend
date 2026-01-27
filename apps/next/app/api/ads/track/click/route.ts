import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient } from '@/lib/api/backendClient'

/**
 * POST /api/ads/track/click
 * 
 * Track ad click events
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Optional: Get access token if user is authenticated
    const accessToken = request.cookies.get('@radio-app:access_token')?.value

    const headers: Record<string, string> = {}
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    // Proxy to backend
    const data = await backendHttpClient.post('/ads/track/click', body, {
      headers,
    })

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Failed to track ad click:', error)

    return NextResponse.json(
      {
        error: 'Failed to track ad click',
        message: error.message,
      },
      { status: error.status || 500 }
    )
  }
}

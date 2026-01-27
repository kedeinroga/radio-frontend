import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient } from '@/lib/api/backendClient'

/**
 * GET /api/analytics/[...path]
 * 
 * Catch-all route for analytics endpoints.
 * Proxies all analytics requests to backend.
 * 
 * Examples:
 * - /api/analytics/users/active → /analytics/users/active
 * - /api/analytics/stations/popular → /analytics/stations/popular
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const accessToken = request.cookies.get('@radio-app:access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Analytics access requires authentication' },
        { status: 401 }
      )
    }

    // Construct backend path from dynamic segments
    // ✅ Next.js 15: params must be awaited
    const { path } = await params
    const backendPath = `/analytics/${path.join('/')}`

    // Get query params from request
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const fullPath = queryString ? `${backendPath}?${queryString}` : backendPath

    // Proxy to backend
    const data = await backendHttpClient.get(fullPath, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Analytics API error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch analytics data',
        message: error.message,
      },
      { status: error.status || 500 }
    )
  }
}

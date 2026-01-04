import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

/**
 * GET /api/admin/security/metrics
 * 
 * Retrieves security metrics for the admin dashboard
 * Proxies to backend /admin/security/metrics endpoint
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = rateLimit(request, RATE_LIMITS.ADMIN)
  if (rateLimitResult) {
    return rateLimitResult
  }
  
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('@radio-app:access_token')?.value
  
  if (!accessToken) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Not authenticated' } },
      { status: 401 }
    )
  }
  
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
    
    // Get query params (period, etc.)
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7d'
    const backendUrl = `${BACKEND_URL}/admin/security/metrics?period=${period}`
    
    const response = await fetch(backendUrl , {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: { code: 'fetch_failed', message: 'Failed to fetch security metrics', details: errorText } },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Security metrics fetch error:', error)
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Internal server error', details: error.message } },
      { status: 500 }
    )
  }
}

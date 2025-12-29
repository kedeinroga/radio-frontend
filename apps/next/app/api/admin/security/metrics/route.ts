import { NextRequest, NextResponse } from 'next/server'
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
  
  const accessToken = request.cookies.get('@radio-app:access_token')?.value
  
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
    
    const response = await fetch(`${BACKEND_URL}/admin/security/metrics?period=${period}`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })
    
    // TEMPORARY: Mock data if backend returns 404
    if (response.status === 404) {
      console.warn('⚠️ Backend endpoint not implemented yet, returning mock data')
      const mockData = {
        total_logins_today: Math.floor(Math.random() * 50) + 10,
        total_logins_week: Math.floor(Math.random() * 300) + 100,
        failed_attempts_today: Math.floor(Math.random() * 10),
        failed_attempts_week: Math.floor(Math.random() * 50) + 5,
        active_sessions: Math.floor(Math.random() * 15) + 1,
        unique_locations_week: Math.floor(Math.random() * 8) + 1,
        trends: {
          logins_trend: (Math.random() * 40 - 10), // -10% to +30%
          failed_attempts_trend: (Math.random() * 20 - 15), // -15% to +5%
        }
      }
      return NextResponse.json(mockData)
    }
    
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

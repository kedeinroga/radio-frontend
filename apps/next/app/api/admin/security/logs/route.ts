import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

/**
 * GET /api/admin/security/logs
 * 
 * Retrieves security event logs for the admin dashboard
 * Proxies to backend /admin/security/logs endpoint
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
    
    // Get query params (page, limit, event_type, etc.)
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '50'
    const eventType = searchParams.get('event_type') || ''
    const search = searchParams.get('search') || ''
    
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(eventType && { event_type: eventType }),
      ...(search && { search }),
    })
    
    const response = await fetch(`${BACKEND_URL}/admin/security/logs?${queryParams}`, {
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
        { error: { code: 'fetch_failed', message: 'Failed to fetch security logs', details: errorText } },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {

    return NextResponse.json(
      { error: { code: 'server_error', message: 'Internal server error', details: error.message } },
      { status: 500 }
    )
  }
}

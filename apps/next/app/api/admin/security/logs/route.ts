import { NextRequest, NextResponse } from 'next/server'
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
  
  const accessToken = request.cookies.get('@radio-app:access_token')?.value
  
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
    
    // TEMPORARY: Mock data if backend returns 404
    if (response.status === 404) {
      console.warn('⚠️ Backend endpoint not implemented yet, returning mock data')
      
      const eventTypes = ['login_success', 'login_failed', 'logout', 'session_revoked', 'token_refresh', 'password_change']
      const mockLogs = Array.from({ length: 15 }, (_, i) => ({
        id: `log_${Date.now()}_${i}`,
        event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        user_id: `user_${Math.random().toString(36).substr(2, 9)}`,
        username: `user${i}@radio.com`,
        ip_address: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        location: {
          city: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'][Math.floor(Math.random() * 5)],
          country: 'Spain'
        },
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        details: 'Mock event for testing purposes'
      }))
      
      const mockData = {
        logs: mockLogs,
        total: 150,
        page: parseInt(page),
        limit: parseInt(limit)
      }
      
      return NextResponse.json(mockData)
    }
    
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
    console.error('Security logs fetch error:', error)
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Internal server error', details: error.message } },
      { status: 500 }
    )
  }
}

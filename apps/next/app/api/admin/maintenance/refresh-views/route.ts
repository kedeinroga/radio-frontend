import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

/**
 * POST /api/admin/maintenance/refresh-views
 * 
 * Refreshes materialized views
 * Proxies to backend /admin/maintenance/refresh-views endpoint
 */
export async function POST(request: NextRequest) {
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
    const body = await request.json().catch(() => ({}))
    
    const response = await fetch(`${BACKEND_URL}/admin/maintenance/refresh-views`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }
    
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('Error refreshing views:', error)
    return NextResponse.json(
      { 
        error: { 
          code: 'internal_error', 
          message: error.message || 'Failed to refresh views' 
        } 
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

/**
 * GET /api/admin/maintenance/check-partitions
 * 
 * Checks if future partitions exist
 * Proxies to backend /admin/maintenance/check-partitions endpoint
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
    
    const response = await fetch(`${BACKEND_URL}/admin/maintenance/check-partitions`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }
    
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {

    return NextResponse.json(
      { 
        error: { 
          code: 'internal_error', 
          message: error.message || 'Failed to check partitions' 
        } 
      },
      { status: 500 }
    )
  }
}

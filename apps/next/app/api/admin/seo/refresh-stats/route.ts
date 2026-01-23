import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

/**
 * POST /api/admin/seo/refresh-stats
 * 
 * Refreshes SEO statistics
 * Proxies to backend /admin/seo/refresh-stats endpoint
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
    
    const response = await fetch(`${BACKEND_URL}/admin/seo/refresh-stats`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    
    // Check if response has content
    const contentType = response.headers.get('content-type')
    let data
    
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text()
      if (text) {
        try {
          data = JSON.parse(text)
        } catch (e) {

          data = { message: 'Invalid JSON response from backend' }
        }
      } else {
        // Empty response body
        data = { success: true, message: 'SEO stats refreshed successfully' }
      }
    } else {
      // Non-JSON response
      const text = await response.text()
      data = { success: response.ok, message: text || 'Operation completed' }
    }
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }
    
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {

    return NextResponse.json(
      { 
        error: { 
          code: 'internal_error', 
          message: error.message || 'Failed to refresh SEO stats' 
        } 
      },
      { status: 500 }
    )
  }
}

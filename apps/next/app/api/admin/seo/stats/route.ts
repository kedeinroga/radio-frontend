import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request, RATE_LIMITS.ADMIN)
    if (rateLimitResult) {
      return rateLimitResult
    }

    // Get token from HttpOnly cookie
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Forward request to backend with auth token
    const backendResponse = await fetch(`${BACKEND_URL}/admin/seo/stats`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text()
      return NextResponse.json(
        { error: errorText || 'Failed to fetch SEO stats' },
        { status: backendResponse.status }
      )
    }

    const data = await backendResponse.json()
    return NextResponse.json(data)
  } catch (error: any) {

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

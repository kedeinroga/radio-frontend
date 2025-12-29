import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = rateLimit(request, RATE_LIMITS.REFRESH)
  if (rateLimitResult) {
    return rateLimitResult
  }
  
  const refreshToken = request.cookies.get('@radio-app:refresh_token')?.value
  
  if (!refreshToken) {
    return NextResponse.json(
      { error: { code: 'no_refresh_token', message: 'No refresh token' } },
      { status: 401 }
    )
  }
  
  try {
    // Llamar al backend
    const response = await fetch('http://localhost:8080/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    })
    
    if (!response.ok) {
      return NextResponse.json(
        { error: { code: 'refresh_failed', message: 'Failed to refresh token' } },
        { status: 401 }
      )
    }
    
    const data = await response.json()
    const { access_token, expires_in, jti } = data
    
    // Actualizar access_token cookie
    const nextResponse = NextResponse.json({ 
      success: true, 
      expires_in, 
      jti 
    })
    
    nextResponse.cookies.set('@radio-app:access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    })
    
    return nextResponse
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

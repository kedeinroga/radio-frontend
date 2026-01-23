import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/auth/sessions
 * 
 * Retrieves all active sessions for the authenticated user
 * Proxies to backend /auth/sessions endpoint
 */
export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('@radio-app:access_token')?.value
  
  if (!accessToken) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Not authenticated' } },
      { status: 401 }
    )
  }
  
  try {
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
    
    const response = await fetch(`${BACKEND_URL}/auth/sessions`, {
      method: 'GET',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: { code: 'fetch_failed', message: 'Failed to fetch sessions', details: errorText } },
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

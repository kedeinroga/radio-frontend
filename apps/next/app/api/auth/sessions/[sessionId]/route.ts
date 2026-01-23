import { NextRequest, NextResponse } from 'next/server'

/**
 * DELETE /api/auth/sessions/:sessionId
 * 
 * Revokes a specific session for the authenticated user
 * Proxies to backend /auth/sessions/:sessionId endpoint
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const accessToken = request.cookies.get('@radio-app:access_token')?.value
  
  if (!accessToken) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Not authenticated' } },
      { status: 401 }
    )
  }
  
  try {
    // Await params in Next.js 15
    const { sessionId } = await params
    
    const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
    
    const response = await fetch(`${BACKEND_URL}/auth/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: { code: 'delete_failed', message: 'Failed to revoke session', details: errorText } },
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

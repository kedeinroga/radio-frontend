import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('@radio-app:access_token')?.value
  
  if (!accessToken) {
    return NextResponse.json(
      { error: { code: 'unauthorized', message: 'Not authenticated' } },
      { status: 401 }
    )
  }
  
  try {
    // Llamar al backend para obtener información del usuario
    const response = await fetch('http://localhost:8080/api/v1/auth/me', {
      headers: { 
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!response.ok) {
      return NextResponse.json(
        { error: { code: 'fetch_failed', message: 'Failed to fetch user info' } },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    
    // Mapear user_type a role para compatibilidad con frontend
    const user = data.user || data
    const mappedUser = {
      id: user.id,
      email: user.email,
      role: user.user_type || user.role
    }
    
    return NextResponse.json(mappedUser)
  } catch (error) {
    return NextResponse.json(
      { error: { code: 'server_error', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = rateLimit(request, RATE_LIMITS.AUTH)
  if (rateLimitResult) {
    return rateLimitResult
  }
  
  try {
    const { email, password } = await request.json()
    
    // 1. Llamar al backend
    const response = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    
    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(error, { status: response.status })
    }
    
    const data = await response.json()
    
    // Extraer tokens
    const { access_token, refresh_token, session_id, expires_in, jti } = data
    
    if (!access_token || !refresh_token) {
      return NextResponse.json(
        { 
          error: { 
            code: 'invalid_response', 
            message: 'Missing authentication tokens' 
          } 
        },
        { status: 500 }
      )
    }
    
    // 2. Obtener información del usuario con el access_token
    const userResponse = await fetch('http://localhost:8080/api/v1/auth/me', {
      headers: { 
        'Authorization': `Bearer ${access_token}`
      }
    })
    
    if (!userResponse.ok) {
      return NextResponse.json(
        { 
          error: { 
            code: 'user_fetch_failed', 
            message: 'Failed to retrieve user information' 
          } 
        },
        { status: 500 }
      )
    }
    
    const userInfo = await userResponse.json()
    
    // Extraer y mapear datos del usuario
    // Backend devuelve: { user: { id, email, user_type } }
    // Frontend espera: { id, email, role }
    const user = userInfo.user || userInfo
    const mappedUser = {
      id: user.id,
      email: user.email,
      role: user.user_type || user.role // user_type del backend se mapea a role
    }
    
    // 3. Crear response con cookies HttpOnly
    const nextResponse = NextResponse.json({ 
      success: true,
      session_id,
      expires_in,
      jti,
      user: mappedUser // Retornar info del usuario mapeada
    })
    
    // 4. Configurar cookies seguras
    nextResponse.cookies.set('@radio-app:access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 días
      path: '/'
    })
    
    nextResponse.cookies.set('@radio-app:refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 días
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

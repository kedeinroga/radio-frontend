import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get('@radio-app:access_token')?.value

  if (accessToken) {
    try {
      // Revocar token en el backend
      await fetch(`${BACKEND_URL}/auth/revoke`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ revoke_all: true })
      })
    } catch (error) {
      // Continuar con logout de todas formas
    }
  }

  // Limpiar cookies
  const response = NextResponse.json({ success: true })
  response.cookies.delete('@radio-app:access_token')
  response.cookies.delete('@radio-app:refresh_token')

  return response
}

import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient } from '@/lib/api/backendClient'

/**
 * Helper para crear API routes de admin con autenticación
 * Extrae el token, valida, y hace proxy al backend
 * 
 * ✅ NO es async porque retorna un handler, no ejecuta código async
 */
export function createAdminProxyHandler(
  backendPath: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET'
) {
  return async (request: NextRequest) => {
    try {
      // Obtener token de cookies
      const accessToken = request.cookies.get('@radio-app:access_token')?.value

      if (!accessToken) {
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 401 }
        )
      }

      // Preparar headers con authorization
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      }

      let data: any

      // Switch basado en método HTTP
      switch (method) {
        case 'GET':
          data = await backendHttpClient.get(backendPath, { headers })
          break
        case 'POST':
          const postBody = await request.json().catch(() => ({}))
          data = await backendHttpClient.post(backendPath, postBody, { headers })
          break
        case 'PUT':
          const putBody = await request.json().catch(() => ({}))
          data = await backendHttpClient.put(backendPath, putBody, { headers })
          break
        case 'DELETE':
          data = await backendHttpClient.delete(backendPath, { headers })
          break
        case 'PATCH':
          const patchBody = await request.json().catch(() => ({}))
          data = await backendHttpClient.patch(backendPath, patchBody, { headers })
          break
      }

      return NextResponse.json(data, { status: 200 })
    } catch (error: any) {
      console.error(`Admin API error (${backendPath}):`, error)

      return NextResponse.json(
        {
          error: `Failed to ${method} ${backendPath}`,
          message: error.message,
        },
        { status: error.status || 500 }
      )
    }
  }
}

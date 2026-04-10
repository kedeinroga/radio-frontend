import { NextRequest, NextResponse } from 'next/server'
import { backendHttpClient, BackendError } from '@/lib/api/backendClient'
import { getTokenRole, isTokenExpired } from '@radio-app/app'
import { rateLimit, RATE_LIMITS } from '@/lib/rateLimit'

/**
 * Dynamic catch-all admin route
 *
 * Handles all admin API requests not covered by specific routes.
 * Proxies requests to backend with authentication.
 *
 * 🔒 Security layers:
 * - Rate limiting
 * - JWT presence check
 * - JWT expiry check (client-side, fast-fail before hitting backend)
 * - Role verification: only 'admin' tokens are allowed
 * - Generic error messages (no internal details leak to client)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleAdminRequest(request, params, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleAdminRequest(request, params, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleAdminRequest(request, params, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleAdminRequest(request, params, 'DELETE')
}

async function handleAdminRequest(
  request: NextRequest,
  params: { path: string[] },
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
) {
  // 🔒 Rate limiting (admins tienen límite más estricto)
  const rateLimitResult = rateLimit(request, RATE_LIMITS.ADMIN)
  if (rateLimitResult) return rateLimitResult

  try {
    const accessToken = request.cookies.get('@radio-app:access_token')?.value

    // 🔒 Verificar que existe un token
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 🔒 Verificar que el token no está expirado (fast-fail antes de llamar al backend)
    if (isTokenExpired(accessToken)) {
      return NextResponse.json(
        { error: 'Unauthorized — session expired' },
        { status: 401 }
      )
    }

    // 🔒 Verificar que el rol del token es 'admin'
    // NOTA: el backend también valida esto — esta es una defensa adicional (defense in depth)
    const role = getTokenRole(accessToken)
    if (role !== 'admin') {
      console.warn(`[Admin proxy] Access denied — role "${role}" is not admin.`)
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Construct backend path from dynamic segments
    const { path } = await params
    const backendPath = `/admin/${path.join('/')}`

    // Get query params
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const fullPath = queryString ? `${backendPath}?${queryString}` : backendPath

    // skipSecret: el backend autentica con el Bearer token del usuario,
    // enviar X-Rradio-Secret simultáneamente causa "session validation failed"
    const reqOptions = {
      headers: { Authorization: `Bearer ${accessToken}` },
      skipSecret: true,
    }

    let data: unknown

    switch (method) {
      case 'GET':
        data = await backendHttpClient.get(fullPath, reqOptions)
        break
      case 'POST': {
        const postBody = await request.json().catch(() => ({}))
        data = await backendHttpClient.post(backendPath, postBody, reqOptions)
        break
      }
      case 'PUT': {
        const putBody = await request.json().catch(() => ({}))
        data = await backendHttpClient.put(backendPath, putBody, reqOptions)
        break
      }
      case 'DELETE':
        data = await backendHttpClient.delete(fullPath, reqOptions)
        break
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error: unknown) {
    if (error instanceof BackendError) {
      // No exponer detalles internos al cliente
      console.error(`[Admin proxy] BackendError ${error.status} (${method}):`, error.body)
      if (error.isUnauthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.isServerError) {
        return NextResponse.json({ error: 'Admin service is unavailable. Please try again later.' }, { status: 502 })
      }
      return NextResponse.json({ error: 'Request failed.' }, { status: error.status })
    }

    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[Admin proxy] Unexpected error (${method}):`, message)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    )
  }
}

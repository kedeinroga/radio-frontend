/**
 * Ad Click Tracking API Route
 * 
 * Endpoint para trackear clicks en anuncios con protección CSRF.
 * Valida el token CSRF antes de registrar el click.
 * 
 * POST /api/ads/track/click
 * 
 * Body:
 * {
 *   advertisementId: string
 *   impressionId: string
 *   context: {
 *     timestamp: number
 *     userAgent: string
 *     referrer: string
 *     screenResolution: string
 *     timezone: string
 *     language: string
 *   }
 * }
 * 
 * Headers:
 * - X-CSRF-Token: required
 * 
 * Response:
 * {
 *   clickId: string
 *   fraudDetection: {
 *     riskScore: number
 *     flags: string[]
 *   }
 * }
 */

import { NextRequest, NextResponse } from 'next/server'

/**
 * Valida el token CSRF del header
 */
function validateCSRF(request: NextRequest): string | null {
  const csrfTokenFromHeader = request.headers.get('x-csrf-token')
  const csrfTokenFromCookie = request.cookies.get('csrf_token')?.value

  if (!csrfTokenFromHeader) {
    return 'Missing CSRF token in header'
  }

  if (!csrfTokenFromCookie) {
    return 'Missing CSRF token in cookie'
  }

  // Comparación constant-time para prevenir timing attacks
  if (csrfTokenFromHeader.length !== csrfTokenFromCookie.length) {
    return 'CSRF token mismatch'
  }

  let result = 0
  for (let i = 0; i < csrfTokenFromHeader.length; i++) {
    result |= csrfTokenFromHeader.charCodeAt(i) ^ csrfTokenFromCookie.charCodeAt(i)
  }

  if (result !== 0) {
    return 'CSRF token mismatch'
  }

  return null // Valid
}

/**
 * POST /api/ads/track/click
 * 
 * Trackea un click en un anuncio con validación CSRF
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validar CSRF token
    const csrfError = validateCSRF(request)
    if (csrfError) {

      return NextResponse.json(
        { error: 'CSRF validation failed', details: csrfError },
        { status: 403 }
      )
    }

    // 2. Parsear body
    const body = await request.json()
    const { advertisementId, impressionId, context } = body

    // 3. Validar campos requeridos
    if (!advertisementId || !impressionId) {
      return NextResponse.json(
        { error: 'Missing required fields: advertisementId, impressionId' },
        { status: 400 }
      )
    }

    // 4. Obtener IP del usuario (para fraud detection)
    const userIp = 
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // 5. Preparar datos para el tracking
    const trackingData = {
      advertisementId,
      impressionId,
      timestamp: context?.timestamp || Date.now(),
      userIp,
      userAgent: context?.userAgent || request.headers.get('user-agent') || 'unknown',
      referrer: context?.referrer || request.headers.get('referer') || '',
      deviceInfo: {
        screenResolution: context?.screenResolution,
        timezone: context?.timezone,
        language: context?.language,
      },
    }

    // 6. Llamar al backend Go para trackear el click
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    const backendResponse = await fetch(`${apiUrl}/api/v1/ads/track/click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(trackingData),
    })

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({}))
      throw new Error(errorData.error || `Backend error: ${backendResponse.status}`)
    }

    const result = await backendResponse.json()

    // 7. Log para monitoring

    // 8. Retornar resultado
    return NextResponse.json({
      clickId: result.clickId,
      fraudDetection: result.fraudDetection || {
        riskScore: 0,
        flags: [],
      },
    })

  } catch (error) {

    return NextResponse.json(
      {
        error: 'Failed to track ad click',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET no permitido
 */
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  )
}

/**
 * Cancel Subscription API Route
 * 
 * POST /api/subscription/cancel
 * 
 * Cancela la suscripción del usuario.
 * 
 * Body:
 * {
 *   subscriptionId: string
 *   cancelImmediately?: boolean
 *   reason?: string
 *   feedback?: string
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   message: string
 *   endsAt?: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getStripeServerClient } from '../../../../lib/stripe'
import { CancelSubscription, SubscriptionApiRepository } from '@radio-app/app'

/**
 * POST /api/subscription/cancel
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Obtener usuario autenticado
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // 2. Parsear body
    const body = await request.json()
    const { subscriptionId, cancelImmediately, reason, feedback } = body

    // 3. Validar campos requeridos
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing required field: subscriptionId' },
        { status: 400 }
      )
    }

    // 4. Crear use case
    const stripe = getStripeServerClient()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    const repository = new SubscriptionApiRepository(apiUrl)

    const cancelSubscription = new CancelSubscription(stripe, repository)

    // 5. Ejecutar
    const result = await cancelSubscription.execute({
      userId,
      subscriptionId,
      cancelImmediately,
      reason,
      feedback,
    })

    // 6. Retornar resultado
    return NextResponse.json({
      success: result.success,
      message: result.message,
      endsAt: result.endsAt?.toISOString(),
    })

  } catch (error) {
    console.error('[Cancel Subscription API] Error:', error)

    const statusCode = error instanceof Error && error.message.includes('not found') 
      ? 404 
      : 500

    return NextResponse.json(
      {
        error: 'Failed to cancel subscription',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: statusCode }
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

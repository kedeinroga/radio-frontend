/**
 * Get User Subscription Status API Route
 * 
 * GET /api/subscription/status
 * 
 * Retorna la información de suscripción del usuario autenticado.
 * 
 * Response:
 * {
 *   subscription: Subscription | null
 *   plan: SubscriptionPlan | null
 *   isActive: boolean
 *   isPremium: boolean
 *   daysRemaining?: number
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { GetUserSubscription, SubscriptionApiRepository } from '@radio-app/app'

/**
 * GET /api/subscription/status
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Obtener usuario autenticado
    const userId = request.headers.get('x-user-id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // 2. Crear use case
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    const repository = new SubscriptionApiRepository(apiUrl)
    const getUserSubscription = new GetUserSubscription(repository)

    // 3. Ejecutar
    const result = await getUserSubscription.execute({ userId })

    // 4. Retornar resultado
    return NextResponse.json({
      subscription: result.subscription,
      plan: result.plan,
      isActive: result.isActive,
      isPremium: result.isPremium,
      daysRemaining: result.daysRemaining,
    })

  } catch (error) {
    console.error('[Subscription Status API] Error:', error)

    return NextResponse.json(
      {
        error: 'Failed to get subscription status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST no permitido
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use GET.' },
    { status: 405 }
  )
}

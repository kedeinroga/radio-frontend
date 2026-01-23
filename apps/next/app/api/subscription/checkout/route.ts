/**
 * Create Checkout Session API Route
 * 
 * POST /api/subscription/checkout
 * 
 * Crea una sesión de checkout de Stripe para suscribirse.
 * 
 * Body:
 * {
 *   planId: string
 *   billingInterval: 'month' | 'year'
 * }
 * 
 * Response:
 * {
 *   sessionId: string
 *   checkoutUrl: string
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getStripeServerClient, getStripePriceIds, stripeConfig } from '../../../../lib/stripe'
import { CreateCheckoutSession } from '@radio-app/app'

/**
 * POST /api/subscription/checkout
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Obtener usuario autenticado
    // TODO: Implementar autenticación real
    // Por ahora, simulamos con headers o cookies
    const userId = request.headers.get('x-user-id') || 'user-123'
    const userEmail = request.headers.get('x-user-email') || 'user@example.com'

    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // 2. Parsear body
    const body = await request.json()
    const { planId, billingInterval } = body

    // 3. Validar campos requeridos
    if (!planId || !billingInterval) {
      return NextResponse.json(
        { error: 'Missing required fields: planId, billingInterval' },
        { status: 400 }
      )
    }

    if (!['month', 'year'].includes(billingInterval)) {
      return NextResponse.json(
        { error: 'billingInterval must be "month" or "year"' },
        { status: 400 }
      )
    }

    // 4. Crear use case
    const stripe = getStripeServerClient()
    const priceIds = getStripePriceIds()

    const createCheckoutSession = new CreateCheckoutSession(stripe, {
      stripePriceIdMonthly: priceIds.monthly,
      stripePriceIdYearly: priceIds.yearly,
      defaultSuccessUrl: stripeConfig.getSuccessUrl('{CHECKOUT_SESSION_ID}'),
      defaultCancelUrl: stripeConfig.getCancelUrl(),
      trialPeriodDays: stripeConfig.trialPeriodDays,
    })

    // 5. Ejecutar
    const result = await createCheckoutSession.execute({
      userId,
      userEmail,
      planId,
      billingInterval,
    })

    // 6. Retornar resultado
    return NextResponse.json({
      sessionId: result.sessionId,
      checkoutUrl: result.checkoutUrl,
    })

  } catch (error) {

    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
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

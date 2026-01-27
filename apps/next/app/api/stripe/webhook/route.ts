/**
 * Stripe Webhook Handler
 * 
 * Maneja eventos de Stripe webhooks para sincronizar suscripciones.
 * 
 * POST /api/stripe/webhook
 * 
 * Eventos manejados:
 * - customer.subscription.created
 * - customer.subscription.updated
 * - customer.subscription.deleted
 * - customer.subscription.trial_will_end
 * - invoice.payment_succeeded
 * - invoice.payment_failed
 * - checkout.session.completed
 * 
 * IMPORTANTE: Configurar el webhook endpoint en Stripe Dashboard
 * con la URL: https://tu-dominio.com/api/stripe/webhook
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { backendHttpClient } from '@/lib/api/backendClient'
import {
  getStripeServerClient,
  getStripeWebhookSecret,
  STRIPE_WEBHOOK_EVENTS,
  isRelevantWebhookEvent,
  logStripeEvent,
  mapStripeStatusToInternal,
} from '../../../../lib/stripe'

/**
 * Verificar firma del webhook
 * 
 * CRÍTICO: Siempre verificar que el webhook viene de Stripe
 * para prevenir ataques de falsificación
 */
function verifyWebhookSignature(
  payload: string,
  signature: string
): Stripe.Event | null {
  try {
    const stripe = getStripeServerClient()
    const webhookSecret = getStripeWebhookSecret()

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    )

    return event
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return null
  }
}

/**
 * Maneja el evento customer.subscription.created
 */
async function handleSubscriptionCreated(
  subscription: Stripe.Subscription
): Promise<void> {
  logStripeEvent('subscription.created', {
    subscriptionId: subscription.id,
    customerId: subscription.customer,
    status: subscription.status,
  })

  try {
    // ✅ Usar backendHttpClient en lugar de fetch directo
    await backendHttpClient.post('/subscriptions', {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId:
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription.customer.id,
      status: mapStripeStatusToInternal(subscription.status),
      stripePriceId: subscription.items.data[0]?.price.id,
      amountCents: subscription.items.data[0]?.price.unit_amount || 0,
      currency: subscription.currency,
      currentPeriodStart: (subscription as any).current_period_start || Math.floor(Date.now() / 1000),
      currentPeriodEnd: (subscription as any).current_period_end || Math.floor(Date.now() / 1000),
      trialStart: (subscription as any).trial_start || undefined,
      trialEnd: (subscription as any).trial_end || undefined,
      cancelAt: (subscription as any).cancel_at || undefined,
      canceledAt: (subscription as any).canceled_at || undefined,
    })
  } catch (error) {
    console.error('Failed to create subscription in backend:', error)
    throw error
  }
}

/**
 * Maneja el evento customer.subscription.updated
 */
async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
): Promise<void> {
  logStripeEvent('subscription.updated', {
    subscriptionId: subscription.id,
    status: subscription.status,
  })

  try {
    // ✅ Usar backendHttpClient
    await backendHttpClient.put(`/subscriptions/stripe/${subscription.id}`, {
      status: mapStripeStatusToInternal(subscription.status),
      currentPeriodStart: (subscription as any).current_period_start || Math.floor(Date.now() / 1000),
      currentPeriodEnd: (subscription as any).current_period_end || Math.floor(Date.now() / 1000),
      cancelAt: (subscription as any).cancel_at || undefined,
      canceledAt: (subscription as any).canceled_at || undefined,
    })
  } catch (error) {
    console.error('Failed to update subscription in backend:', error)
    throw error
  }
}

/**
 * Maneja el evento customer.subscription.deleted
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  logStripeEvent('subscription.deleted', {
    subscriptionId: subscription.id,
  })

  try {
    // ✅ Usar backendHttpClient
    await backendHttpClient.delete(`/subscriptions/stripe/${subscription.id}`)
  } catch (error) {
    console.error('Failed to delete subscription in backend:', error)
    throw error
  }
}

/**
 * Maneja el evento customer.subscription.trial_will_end
 */
async function handleTrialWillEnd(
  subscription: Stripe.Subscription
): Promise<void> {
  logStripeEvent('subscription.trial_will_end', {
    subscriptionId: subscription.id,
    trialEnd: subscription.trial_end,
  })

  // TODO: Enviar email al usuario notificando que el trial está por terminar
  console.log(`Trial will end for subscription ${subscription.id}`)
}

/**
 * Maneja el evento invoice.payment_succeeded
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = (invoice as any).subscription || null

  logStripeEvent('invoice.payment_succeeded', {
    invoiceId: invoice.id,
    subscriptionId,
    amountPaid: invoice.amount_paid,
  })

  // TODO: Actualizar estado de pago en la base de datos
  console.log(`Payment succeeded for invoice ${invoice.id}`)
}

/**
 * Maneja el evento invoice.payment_failed
 */
async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  const subscriptionId = (invoice as any).subscription || null

  logStripeEvent('invoice.payment_failed', {
    invoiceId: invoice.id,
    subscriptionId,
    attemptCount: invoice.attempt_count,
  })

  // TODO: Notificar al usuario del pago fallido
  console.log(`Payment failed for invoice ${invoice.id}`)
}

/**
 * Maneja el evento checkout.session.completed
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  logStripeEvent('checkout.session.completed', {
    sessionId: session.id,
    customerId: session.customer,
    subscriptionId: session.subscription,
  })

  // TODO: Confirmar creación de suscripción después del checkout
  console.log(`Checkout completed for session ${session.id}`)
}

/**
 * Router de eventos
 * Dirige cada evento a su handler correspondiente
 */
async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_CREATED:
      await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
      break

    case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_UPDATED:
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
      break

    case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_DELETED:
      await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
      break

    case STRIPE_WEBHOOK_EVENTS.SUBSCRIPTION_TRIAL_WILL_END:
      await handleTrialWillEnd(event.data.object as Stripe.Subscription)
      break

    case STRIPE_WEBHOOK_EVENTS.PAYMENT_SUCCEEDED:
      await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
      break

    case STRIPE_WEBHOOK_EVENTS.PAYMENT_FAILED:
      await handlePaymentFailed(event.data.object as Stripe.Invoice)
      break

    case STRIPE_WEBHOOK_EVENTS.CHECKOUT_SESSION_COMPLETED:
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
      break

    default:
      console.log(`Unhandled webhook event type: ${event.type}`)
  }
}

/**
 * POST /api/stripe/webhook
 * 
 * Endpoint principal del webhook
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Obtener el payload y la firma
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // 2. Verificar la firma del webhook
    const event = verifyWebhookSignature(payload, signature)

    if (!event) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    // 3. Verificar que sea un evento relevante
    if (!isRelevantWebhookEvent(event.type)) {
      console.log(`Ignoring webhook event: ${event.type}`)
      return NextResponse.json({ received: true })
    }

    // 4. Procesar el evento
    await handleWebhookEvent(event)

    // 5. Retornar respuesta exitosa
    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook processing failed:', error)
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
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
    { error: 'Method not allowed. Webhooks must use POST.' },
    { status: 405 }
  )
}

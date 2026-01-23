/**
 * Stripe Client Configuration
 * 
 * Cliente de Stripe para manejar pagos y suscripciones.
 * Configurado para Next.js con soporte para server-side y client-side.
 */

import Stripe from 'stripe'

/**
 * Verificar que las variables de entorno estén configuradas
 */
function validateStripeConfig() {
  const requiredEnvVars = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  }

  const missing = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(
      `Missing Stripe configuration. Please set: ${missing.join(', ')}`
    )
  }
}

/**
 * Inicializar cliente de Stripe (server-side)
 * 
 * IMPORTANTE: Este cliente solo debe usarse en el servidor (API routes, Server Components)
 * NUNCA exponer la secret key en el cliente.
 */
export function getStripeServerClient(): Stripe {
  validateStripeConfig()

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-12-15.clover', // Última versión estable
    typescript: true,
    appInfo: {
      name: 'Radio App',
      version: '1.0.0',
    },
  })

  return stripe
}

/**
 * Obtener la publishable key para el cliente
 * Esta función es segura para usar en el cliente
 */
export function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

  if (!key) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured')
  }

  return key
}

/**
 * Obtener el webhook secret
 * Solo para usar en API routes que reciben webhooks
 */
export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
  }

  return secret
}

/**
 * Obtener IDs de precios configurados
 */
export function getStripePriceIds() {
  return {
    monthly: process.env.STRIPE_PRICE_ID_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_ID_YEARLY || '',
  }
}

/**
 * Configuración de Stripe
 */
export const stripeConfig = {
  /**
   * Moneda por defecto
   */
  defaultCurrency: 'usd',

  /**
   * Trial period (días)
   */
  trialPeriodDays: 14,

  /**
   * Máximo de intentos de pago
   */
  maxPaymentAttempts: 3,

  /**
   * URLs de éxito y cancelación
   */
  getSuccessUrl: (sessionId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/subscription/success?session_id=${sessionId}`
  },

  getCancelUrl: () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/subscription/cancel`
  },

  /**
   * Billing portal URL
   */
  getBillingPortalUrl: () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return `${baseUrl}/subscription/manage`
  },
} as const

/**
 * Tipos de eventos de Stripe que manejamos
 */
export const STRIPE_WEBHOOK_EVENTS = {
  // Subscription events
  SUBSCRIPTION_CREATED: 'customer.subscription.created',
  SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
  SUBSCRIPTION_TRIAL_WILL_END: 'customer.subscription.trial_will_end',

  // Payment events
  PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  PAYMENT_FAILED: 'invoice.payment_failed',

  // Customer events
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
  CUSTOMER_DELETED: 'customer.deleted',

  // Checkout events
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
  CHECKOUT_SESSION_EXPIRED: 'checkout.session.expired',
} as const

/**
 * Helper para verificar si un evento es relevante
 */
export function isRelevantWebhookEvent(eventType: string): boolean {
  return Object.values(STRIPE_WEBHOOK_EVENTS).includes(
    eventType as (typeof STRIPE_WEBHOOK_EVENTS)[keyof typeof STRIPE_WEBHOOK_EVENTS]
  )
}

/**
 * Mapeo de status de Stripe a nuestros status internos
 */
export function mapStripeStatusToInternal(
  stripeStatus: Stripe.Subscription.Status
): 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'paused' {
  const statusMap: Record<Stripe.Subscription.Status, ReturnType<typeof mapStripeStatusToInternal>> = {
    active: 'active',
    trialing: 'trialing',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'unpaid',
    incomplete: 'incomplete',
    incomplete_expired: 'incomplete_expired',
    paused: 'paused',
  }

  return statusMap[stripeStatus] || 'incomplete'
}

/**
 * Helper para crear un idempotency key único
 * Usado para prevenir duplicación de cargos
 */
export function createIdempotencyKey(prefix: string, data: string): string {
  const hash = Buffer.from(`${prefix}-${data}-${Date.now()}`).toString('base64url')
  return hash.slice(0, 32) // Stripe requiere max 255 chars
}

/**
 * Formatter de errores de Stripe
 */
export function formatStripeError(error: unknown): string {
  if (error instanceof Stripe.errors.StripeError) {
    const stripeError = error as Stripe.errors.StripeError
    
    switch (stripeError.type) {
      case 'StripeCardError':
        return `Card error: ${stripeError.message}`
      case 'StripeInvalidRequestError':
        return `Invalid request: ${stripeError.message}`
      case 'StripeAPIError':
        return 'Stripe API error. Please try again later.'
      case 'StripeConnectionError':
        return 'Network error. Please check your connection.'
      case 'StripeAuthenticationError':
        return 'Authentication error with payment provider.'
      case 'StripeRateLimitError':
        return 'Too many requests. Please try again later.'
      default:
        return `Payment error: ${stripeError.message}`
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Unknown payment error occurred'
}

/**
 * Verificar si estamos en modo de prueba
 */
export function isStripeTestMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY || ''
  return key.startsWith('sk_test_')
}

/**
 * Log helper para desarrollo
 */
export function logStripeEvent(_eventType: string, _data: any) {
  // Stripe event logging silenced
}

export default getStripeServerClient

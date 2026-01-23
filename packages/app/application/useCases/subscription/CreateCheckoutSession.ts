/**
 * Create Checkout Session Use Case
 * 
 * Crea una sesión de checkout de Stripe para que el usuario pueda suscribirse.
 * 
 * Flujo:
 * 1. Valida el plan seleccionado
 * 2. Crea o recupera el customer de Stripe
 * 3. Crea la checkout session con los parámetros correctos
 * 4. Retorna la URL de checkout
 */

import Stripe from 'stripe'
import type { BillingInterval } from '../../../domain/entities/Subscription'

export interface CreateCheckoutSessionRequest {
  userId: string
  userEmail: string
  planId: string
  billingInterval: BillingInterval
  successUrl?: string
  cancelUrl?: string
  trialPeriodDays?: number
  metadata?: Record<string, string>
}

export interface CreateCheckoutSessionResponse {
  sessionId: string
  checkoutUrl: string
  customerId: string
}

export class CreateCheckoutSession {
  constructor(
    private readonly stripe: Stripe,
    private readonly config: {
      stripePriceIdMonthly: string
      stripePriceIdYearly: string
      defaultSuccessUrl: string
      defaultCancelUrl: string
      trialPeriodDays: number
    }
  ) {}

  async execute(
    request: CreateCheckoutSessionRequest
  ): Promise<CreateCheckoutSessionResponse> {
    // 1. Validar request
    this.validateRequest(request)

    // 2. Determinar el price ID según el intervalo de facturación
    const priceId = this.getPriceId(request.billingInterval)

    // 3. Crear o recuperar Stripe customer
    const customerId = await this.getOrCreateCustomer(
      request.userId,
      request.userEmail
    )

    // 4. Crear checkout session
    const session = await this.createSession({
      customerId,
      priceId,
      successUrl: request.successUrl || this.config.defaultSuccessUrl,
      cancelUrl: request.cancelUrl || this.config.defaultCancelUrl,
      trialPeriodDays: request.trialPeriodDays ?? this.config.trialPeriodDays,
      metadata: {
        userId: request.userId,
        planId: request.planId,
        ...request.metadata,
      },
    })

    // 5. Retornar resultado
    return {
      sessionId: session.id,
      checkoutUrl: session.url!,
      customerId,
    }
  }

  /**
   * Valida el request
   */
  private validateRequest(request: CreateCheckoutSessionRequest): void {
    if (!request.userId) {
      throw new Error('userId is required')
    }

    if (!request.userEmail) {
      throw new Error('userEmail is required')
    }

    if (!request.planId) {
      throw new Error('planId is required')
    }

    if (!['month', 'year'].includes(request.billingInterval)) {
      throw new Error('billingInterval must be "month" or "year"')
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(request.userEmail)) {
      throw new Error('Invalid email format')
    }
  }

  /**
   * Obtiene el price ID según el intervalo de facturación
   */
  private getPriceId(interval: BillingInterval): string {
    const priceId =
      interval === 'month'
        ? this.config.stripePriceIdMonthly
        : this.config.stripePriceIdYearly

    if (!priceId) {
      throw new Error(`No price ID configured for interval: ${interval}`)
    }

    return priceId
  }

  /**
   * Obtiene o crea un customer en Stripe
   */
  private async getOrCreateCustomer(
    userId: string,
    email: string
  ): Promise<string> {
    try {
      // 1. Buscar customer existente por metadata
      const existingCustomers = await this.stripe.customers.list({
        email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        const customer = existingCustomers.data[0]
        return customer.id
      }

      // 2. Crear nuevo customer
      const newCustomer = await this.stripe.customers.create({
        email,
        metadata: {
          userId,
        },
      })

      return newCustomer.id

    } catch (error) {
      throw new Error('Failed to create or retrieve customer')
    }
  }

  /**
   * Crea la checkout session en Stripe
   */
  private async createSession(params: {
    customerId: string
    priceId: string
    successUrl: string
    cancelUrl: string
    trialPeriodDays: number
    metadata: Record<string, string>
  }): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: params.customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: params.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${params.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: params.cancelUrl,
        subscription_data: {
          trial_period_days: params.trialPeriodDays,
          metadata: params.metadata,
        },
        metadata: params.metadata,
        allow_promotion_codes: true, // Permitir códigos de descuento
        billing_address_collection: 'auto', // Recopilar dirección de facturación
        customer_update: {
          address: 'auto', // Actualizar dirección automáticamente
        },
      })

      return session

    } catch (error) {
      throw new Error('Failed to create checkout session')
    }
  }
}

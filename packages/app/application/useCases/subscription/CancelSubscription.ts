/**
 * Cancel Subscription Use Case
 * 
 * Cancela una suscripción activa del usuario.
 * 
 * Opciones:
 * - Cancelar inmediatamente
 * - Cancelar al final del período actual (recommended)
 */

import Stripe from 'stripe'
import type { ISubscriptionRepository } from '../../../domain/repositories/ISubscriptionRepository'

export interface CancelSubscriptionRequest {
  userId: string
  subscriptionId: string
  cancelImmediately?: boolean // false = al final del período
  reason?: string
  feedback?: string
}

export interface CancelSubscriptionResponse {
  success: boolean
  subscriptionId: string
  canceledAt: Date
  endsAt?: Date // Si no es inmediato
  message: string
}

export class CancelSubscription {
  constructor(
    private readonly stripe: Stripe,
    private readonly subscriptionRepository: ISubscriptionRepository
  ) {}

  async execute(
    request: CancelSubscriptionRequest
  ): Promise<CancelSubscriptionResponse> {
    // 1. Validar request
    this.validateRequest(request)

    // 2. Obtener suscripción de nuestra DB
    const subscription = await this.subscriptionRepository.getById(
      request.subscriptionId
    )

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    // 3. Verificar que pertenece al usuario
    if (subscription.userId !== request.userId) {
      throw new Error('Subscription does not belong to this user')
    }

    // 4. Verificar que esté activa
    if (subscription.status === 'canceled') {
      throw new Error('Subscription is already canceled')
    }

    // 5. Cancelar en Stripe
    const canceledStripeSubscription = await this.cancelInStripe(
      subscription.stripeSubscriptionId,
      request.cancelImmediately || false
    )

    // 6. Actualizar en nuestra DB
    const now = new Date()
    const endsAt = request.cancelImmediately
      ? now
      : new Date((canceledStripeSubscription as any).current_period_end * 1000)

    await this.subscriptionRepository.update(request.subscriptionId, {
      status: 'canceled',
      canceledAt: now,
      cancelAt: request.cancelImmediately ? now : endsAt,
    })

    // 7. Retornar resultado
    return {
      success: true,
      subscriptionId: request.subscriptionId,
      canceledAt: now,
      endsAt: request.cancelImmediately ? undefined : endsAt,
      message: request.cancelImmediately
        ? 'Subscription canceled immediately. Access revoked.'
        : `Subscription will remain active until ${endsAt.toLocaleDateString()}`,
    }
  }

  /**
   * Valida el request
   */
  private validateRequest(request: CancelSubscriptionRequest): void {
    if (!request.userId) {
      throw new Error('userId is required')
    }

    if (!request.subscriptionId) {
      throw new Error('subscriptionId is required')
    }
  }

  /**
   * Cancela la suscripción en Stripe
   */
  private async cancelInStripe(
    stripeSubscriptionId: string,
    immediate: boolean
  ): Promise<Stripe.Subscription> {
    try {
      if (immediate) {
        // Cancelar inmediatamente
        return await this.stripe.subscriptions.cancel(stripeSubscriptionId, {
          prorate: true, // Prorratear el reembolso
        })
      } else {
        // Cancelar al final del período
        return await this.stripe.subscriptions.update(stripeSubscriptionId, {
          cancel_at_period_end: true,
        })
      }
    } catch (error) {
      throw new Error('Failed to cancel subscription in Stripe')
    }
  }
}

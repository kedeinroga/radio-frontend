/**
 * Resume Subscription Use Case
 * 
 * Reanuda una suscripción que fue cancelada pero aún no expiró.
 */

import Stripe from 'stripe'
import type { ISubscriptionRepository } from '../../../domain/repositories/ISubscriptionRepository'

export interface ResumeSubscriptionRequest {
  userId: string
  subscriptionId: string
}

export interface ResumeSubscriptionResponse {
  success: boolean
  subscriptionId: string
  message: string
}

export class ResumeSubscription {
  constructor(
    private readonly stripe: Stripe,
    private readonly subscriptionRepository: ISubscriptionRepository
  ) {}

  async execute(
    request: ResumeSubscriptionRequest
  ): Promise<ResumeSubscriptionResponse> {
    // 1. Validar request
    if (!request.userId) {
      throw new Error('userId is required')
    }

    if (!request.subscriptionId) {
      throw new Error('subscriptionId is required')
    }

    // 2. Obtener suscripción
    const subscription = await this.subscriptionRepository.getById(
      request.subscriptionId
    )

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    // 3. Verificar ownership
    if (subscription.userId !== request.userId) {
      throw new Error('Subscription does not belong to this user')
    }

    // 4. Verificar que esté programada para cancelar
    if (!subscription.cancelAt) {
      throw new Error('Subscription is not scheduled for cancellation')
    }

    // 5. Reanudar en Stripe
    try {
      await this.stripe.subscriptions.update(
        subscription.stripeSubscriptionId,
        {
          cancel_at_period_end: false,
        }
      )
    } catch (error) {
      console.error('[ResumeSubscription] Stripe error:', error)
      throw new Error('Failed to resume subscription in Stripe')
    }

    // 6. Actualizar en DB
    await this.subscriptionRepository.update(request.subscriptionId, {
      cancelAt: undefined,
      status: 'active',
    })

    // 7. Log
    console.log('[ResumeSubscription] Subscription resumed:', {
      subscriptionId: request.subscriptionId,
      userId: request.userId,
    })

    return {
      success: true,
      subscriptionId: request.subscriptionId,
      message: 'Subscription resumed successfully',
    }
  }
}

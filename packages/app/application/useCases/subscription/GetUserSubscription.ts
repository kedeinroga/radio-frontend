/**
 * Get User Subscription Use Case
 * 
 * Obtiene la suscripción activa de un usuario.
 * Incluye información del plan y estado actual.
 */

import type { ISubscriptionRepository } from '../../../domain/repositories/ISubscriptionRepository'
import type { Subscription } from '../../../domain/entities/Subscription'
import { isSubscriptionActive } from '../../../domain/entities/Subscription'
import { getPlanById, type SubscriptionPlan } from '../../../domain/entities/SubscriptionPlan'

export interface GetUserSubscriptionRequest {
  userId: string
}

export interface GetUserSubscriptionResponse {
  subscription: Subscription | null
  plan: SubscriptionPlan | null
  isActive: boolean
  isPremium: boolean
  daysRemaining?: number
}

export class GetUserSubscription {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository
  ) {}

  async execute(
    request: GetUserSubscriptionRequest
  ): Promise<GetUserSubscriptionResponse> {
    // 1. Validar request
    if (!request.userId) {
      throw new Error('userId is required')
    }

    // 2. Obtener suscripción del usuario
    const subscription = await this.subscriptionRepository.getByUserId(
      request.userId
    )

    // 3. Si no tiene suscripción, retornar plan free
    if (!subscription) {
      const freePlan = getPlanById('plan-free')
      return {
        subscription: null,
        plan: freePlan || null,
        isActive: false,
        isPremium: false,
      }
    }

    // 4. Verificar si está activa
    const active = isSubscriptionActive(subscription)

    // 5. Obtener plan asociado
    const plan = getPlanById(subscription.planId)

    // 6. Calcular días restantes
    const daysRemaining = this.calculateDaysRemaining(subscription)

    // 7. Retornar resultado
    return {
      subscription,
      plan: plan || null,
      isActive: active,
      isPremium: active && plan?.type === 'premium',
      daysRemaining: active ? daysRemaining : undefined,
    }
  }

  /**
   * Calcula días restantes en el período actual
   */
  private calculateDaysRemaining(subscription: Subscription): number {
    const now = Date.now()
    const endTime = subscription.currentPeriodEnd.getTime()

    if (endTime <= now) {
      return 0
    }

    const msPerDay = 24 * 60 * 60 * 1000
    return Math.ceil((endTime - now) / msPerDay)
  }
}

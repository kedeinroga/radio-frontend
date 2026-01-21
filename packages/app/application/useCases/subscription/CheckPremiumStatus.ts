/**
 * Check Premium Status Use Case
 * 
 * Verifica rápidamente si un usuario tiene acceso premium activo.
 * Optimizado para ser llamado frecuentemente (ej: antes de mostrar ads).
 */

import type { ISubscriptionRepository } from '../../../domain/repositories/ISubscriptionRepository'
import { isSubscriptionActive } from '../../../domain/entities/Subscription'

export interface CheckPremiumStatusRequest {
  userId: string
}

export interface CheckPremiumStatusResponse {
  isPremium: boolean
  subscriptionId?: string
  expiresAt?: Date
}

export class CheckPremiumStatus {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository
  ) {}

  async execute(
    request: CheckPremiumStatusRequest
  ): Promise<CheckPremiumStatusResponse> {
    // 1. Validar request
    if (!request.userId) {
      throw new Error('userId is required')
    }

    // 2. Obtener suscripción del usuario
    const subscription = await this.subscriptionRepository.getByUserId(
      request.userId
    )

    // 3. Si no tiene suscripción, no es premium
    if (!subscription) {
      return {
        isPremium: false,
      }
    }

    // 4. Verificar si está activa
    const active = isSubscriptionActive(subscription)

    // 5. Retornar resultado
    return {
      isPremium: active,
      subscriptionId: active ? subscription.id : undefined,
      expiresAt: active ? subscription.currentPeriodEnd : undefined,
    }
  }
}

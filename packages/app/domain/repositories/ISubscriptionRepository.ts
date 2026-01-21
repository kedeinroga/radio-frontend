/**
 * Subscription Repository Interface
 * 
 * Define las operaciones para gestionar suscripciones de usuarios.
 */

import type { Subscription, SubscriptionStatus } from '../entities/Subscription'

export interface ISubscriptionRepository {
  /**
   * Obtiene una suscripción por ID
   */
  getById(id: string): Promise<Subscription | null>

  /**
   * Obtiene una suscripción por ID de Stripe
   */
  getByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription | null>

  /**
   * Obtiene una suscripción por ID de usuario
   * Retorna la suscripción activa del usuario, si existe
   */
  getByUserId(userId: string): Promise<Subscription | null>

  /**
   * Obtiene todas las suscripciones de un usuario
   * Incluye suscripciones activas, canceladas, etc.
   */
  getAllByUserId(userId: string): Promise<Subscription[]>

  /**
   * Obtiene una suscripción por ID de customer de Stripe
   */
  getByStripeCustomerId(stripeCustomerId: string): Promise<Subscription | null>

  /**
   * Crea una nueva suscripción
   */
  create(subscription: Subscription): Promise<Subscription>

  /**
   * Actualiza una suscripción existente
   */
  update(id: string, updates: Partial<Subscription>): Promise<Subscription>

  /**
   * Actualiza el estado de una suscripción
   */
  updateStatus(id: string, status: SubscriptionStatus): Promise<Subscription>

  /**
   * Cancela una suscripción
   * Marca la fecha de cancelación y opcionalmente la fecha de fin
   */
  cancel(id: string, cancelAt?: Date): Promise<Subscription>

  /**
   * Elimina una suscripción (soft delete)
   */
  delete(id: string): Promise<void>

  /**
   * Obtiene suscripciones que están por vencer
   * Útil para enviar recordatorios
   */
  getExpiringSoon(days: number): Promise<Subscription[]>

  /**
   * Obtiene suscripciones con pagos vencidos
   */
  getPastDue(): Promise<Subscription[]>

  /**
   * Verifica si un usuario tiene una suscripción activa
   */
  hasActiveSubscription(userId: string): Promise<boolean>
}

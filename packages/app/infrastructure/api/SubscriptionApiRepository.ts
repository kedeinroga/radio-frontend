/**
 * Subscription API Repository
 * 
 * Implementación del repositorio de suscripciones que se comunica con el backend Go.
 */

import type {
  ISubscriptionRepository,
} from '../../domain/repositories/ISubscriptionRepository'
import type { Subscription, SubscriptionStatus } from '../../domain/entities/Subscription'

export class SubscriptionApiRepository implements ISubscriptionRepository {
  constructor(private readonly apiUrl: string) {}

  async getById(id: string): Promise<Subscription | null> {
    try {
      const response = await fetch(`${this.apiUrl}/subscriptions/${id}`)
      
      if (response.status === 404) {
        return null
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      return this.mapToSubscription(data)
    } catch (error) {

      throw error
    }
  }

  async getByStripeSubscriptionId(
    stripeSubscriptionId: string
  ): Promise<Subscription | null> {
    try {
      const response = await fetch(
        `${this.apiUrl}/subscriptions/stripe/${stripeSubscriptionId}`
      )
      
      if (response.status === 404) {
        return null
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      return this.mapToSubscription(data)
    } catch (error) {

      throw error
    }
  }

  async getByUserId(userId: string): Promise<Subscription | null> {
    try {
      const response = await fetch(
        `${this.apiUrl}/subscriptions/user/${userId}/active`
      )
      
      if (response.status === 404) {
        return null
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      return this.mapToSubscription(data)
    } catch (error) {

      throw error
    }
  }

  async getAllByUserId(userId: string): Promise<Subscription[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/subscriptions/user/${userId}`
      )
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      return data.map((item: any) => this.mapToSubscription(item))
    } catch (error) {

      throw error
    }
  }

  async getByStripeCustomerId(
    stripeCustomerId: string
  ): Promise<Subscription | null> {
    try {
      const response = await fetch(
        `${this.apiUrl}/subscriptions/customer/${stripeCustomerId}`
      )
      
      if (response.status === 404) {
        return null
      }
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      return this.mapToSubscription(data)
    } catch (error) {

      throw error
    }
  }

  async create(subscription: Subscription): Promise<Subscription> {
    try {
      const response = await fetch(`${this.apiUrl}/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.mapToAPI(subscription)),
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      return this.mapToSubscription(data)
    } catch (error) {

      throw error
    }
  }

  async update(
    id: string,
    updates: Partial<Subscription>
  ): Promise<Subscription> {
    try {
      const response = await fetch(`${this.apiUrl}/subscriptions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.mapToAPI(updates as Subscription)),
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      return this.mapToSubscription(data)
    } catch (error) {

      throw error
    }
  }

  async updateStatus(
    id: string,
    status: SubscriptionStatus
  ): Promise<Subscription> {
    return this.update(id, { status } as Partial<Subscription>)
  }

  async cancel(id: string, cancelAt?: Date): Promise<Subscription> {
    try {
      const response = await fetch(`${this.apiUrl}/subscriptions/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cancelAt: cancelAt?.toISOString() }),
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      return this.mapToSubscription(data)
    } catch (error) {

      throw error
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/subscriptions/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
    } catch (error) {

      throw error
    }
  }

  async getExpiringSoon(days: number): Promise<Subscription[]> {
    try {
      const response = await fetch(
        `${this.apiUrl}/subscriptions/expiring?days=${days}`
      )
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      return data.map((item: any) => this.mapToSubscription(item))
    } catch (error) {

      throw error
    }
  }

  async getPastDue(): Promise<Subscription[]> {
    try {
      const response = await fetch(`${this.apiUrl}/subscriptions/past-due`)
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }
      
      const data = await response.json()
      return data.map((item: any) => this.mapToSubscription(item))
    } catch (error) {

      throw error
    }
  }

  async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = await this.getByUserId(userId)
      return subscription !== null
    } catch (error) {

      return false
    }
  }

  /**
   * Mapea respuesta de la API a entidad Subscription
   */
  private mapToSubscription(data: any): Subscription {
    return {
      id: data.id,
      userId: data.userId || data.user_id,
      stripeSubscriptionId: data.stripeSubscriptionId || data.stripe_subscription_id,
      stripeCustomerId: data.stripeCustomerId || data.stripe_customer_id,
      planId: data.planId || data.plan_id,
      stripePriceId: data.stripePriceId || data.stripe_price_id,
      billingInterval: data.billingInterval || data.billing_interval,
      status: data.status,
      amountCents: data.amountCents || data.amount_cents,
      currency: data.currency,
      currentPeriodStart: new Date(data.currentPeriodStart || data.current_period_start),
      currentPeriodEnd: new Date(data.currentPeriodEnd || data.current_period_end),
      cancelAt: data.cancelAt || data.cancel_at ? new Date(data.cancelAt || data.cancel_at) : undefined,
      canceledAt: data.canceledAt || data.canceled_at ? new Date(data.canceledAt || data.canceled_at) : undefined,
      trialStart: data.trialStart || data.trial_start ? new Date(data.trialStart || data.trial_start) : undefined,
      trialEnd: data.trialEnd || data.trial_end ? new Date(data.trialEnd || data.trial_end) : undefined,
      createdAt: new Date(data.createdAt || data.created_at),
      updatedAt: new Date(data.updatedAt || data.updated_at),
    }
  }

  /**
   * Mapea entidad Subscription a formato de API
   */
  private mapToAPI(subscription: Subscription): any {
    return {
      id: subscription.id,
      user_id: subscription.userId,
      stripe_subscription_id: subscription.stripeSubscriptionId,
      stripe_customer_id: subscription.stripeCustomerId,
      plan_id: subscription.planId,
      stripe_price_id: subscription.stripePriceId,
      billing_interval: subscription.billingInterval,
      status: subscription.status,
      amount_cents: subscription.amountCents,
      currency: subscription.currency,
      current_period_start: subscription.currentPeriodStart.toISOString(),
      current_period_end: subscription.currentPeriodEnd.toISOString(),
      cancel_at: subscription.cancelAt?.toISOString(),
      canceled_at: subscription.canceledAt?.toISOString(),
      trial_start: subscription.trialStart?.toISOString(),
      trial_end: subscription.trialEnd?.toISOString(),
      created_at: subscription.createdAt.toISOString(),
      updated_at: subscription.updatedAt.toISOString(),
    }
  }
}

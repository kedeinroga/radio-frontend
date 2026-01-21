/**
 * Subscription Entity
 * 
 * Representa una suscripción premium de un usuario.
 * Contiene información sobre el estado, plan, y fechas de la suscripción.
 */

/**
 * Estado de la suscripción
 */
export type SubscriptionStatus = 
  | 'active'        // Suscripción activa y pagada
  | 'trialing'      // En período de prueba
  | 'past_due'      // Pago vencido, intentando cobrar
  | 'canceled'      // Cancelada por el usuario
  | 'unpaid'        // No pagada después de varios intentos
  | 'incomplete'    // Pago inicial no completado
  | 'incomplete_expired' // Pago inicial expiró sin completar
  | 'paused'        // Pausada temporalmente

/**
 * Intervalo de facturación
 */
export type BillingInterval = 'month' | 'year'

/**
 * Entidad Subscription
 */
export interface Subscription {
  // Identificación
  id: string                    // ID interno de nuestra DB
  userId: string                // Usuario dueño de la suscripción
  stripeSubscriptionId: string  // ID de Stripe
  stripeCustomerId: string      // ID del customer en Stripe
  
  // Plan y Precio
  planId: string                // ID del plan (basic, premium, etc.)
  stripePriceId: string         // ID del price en Stripe
  billingInterval: BillingInterval
  
  // Estado
  status: SubscriptionStatus
  
  // Pricing
  amountCents: number           // Precio en centavos
  currency: string              // 'usd', 'eur', 'mxn', etc.
  
  // Fechas
  currentPeriodStart: Date      // Inicio del período actual
  currentPeriodEnd: Date        // Fin del período actual
  cancelAt?: Date               // Fecha programada de cancelación
  canceledAt?: Date             // Fecha cuando se canceló
  trialStart?: Date             // Inicio del trial (si aplica)
  trialEnd?: Date               // Fin del trial (si aplica)
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

/**
 * Factory para crear una nueva entidad Subscription
 */
export function createSubscription(
  data: Partial<Subscription> & Pick<
    Subscription,
    'id' | 'userId' | 'stripeSubscriptionId' | 'stripeCustomerId' | 'planId' | 'stripePriceId'
  >
): Subscription {
  const now = new Date()
  
  return {
    // Required fields
    id: data.id,
    userId: data.userId,
    stripeSubscriptionId: data.stripeSubscriptionId,
    stripeCustomerId: data.stripeCustomerId,
    planId: data.planId,
    stripePriceId: data.stripePriceId,
    
    // Optional fields with defaults
    billingInterval: data.billingInterval || 'month',
    status: data.status || 'incomplete',
    amountCents: data.amountCents || 0,
    currency: data.currency || 'usd',
    currentPeriodStart: data.currentPeriodStart || now,
    currentPeriodEnd: data.currentPeriodEnd || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
    cancelAt: data.cancelAt,
    canceledAt: data.canceledAt,
    trialStart: data.trialStart,
    trialEnd: data.trialEnd,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
  }
}

/**
 * Verifica si la suscripción está activa
 */
export function isSubscriptionActive(subscription: Subscription): boolean {
  const now = Date.now()
  
  // Estados que consideramos "activos"
  const activeStatuses: SubscriptionStatus[] = ['active', 'trialing']
  
  if (!activeStatuses.includes(subscription.status)) {
    return false
  }
  
  // Verificar que no haya expirado el período actual
  return subscription.currentPeriodEnd.getTime() > now
}

/**
 * Verifica si la suscripción está en trial
 */
export function isSubscriptionInTrial(subscription: Subscription): boolean {
  if (subscription.status !== 'trialing') {
    return false
  }
  
  if (!subscription.trialEnd) {
    return false
  }
  
  return subscription.trialEnd.getTime() > Date.now()
}

/**
 * Verifica si la suscripción está cancelada o va a cancelarse
 */
export function isSubscriptionCanceled(subscription: Subscription): boolean {
  return subscription.status === 'canceled' || !!subscription.cancelAt
}

/**
 * Calcula días restantes en el período actual
 */
export function getDaysRemainingInPeriod(subscription: Subscription): number {
  const now = Date.now()
  const endTime = subscription.currentPeriodEnd.getTime()
  
  if (endTime <= now) {
    return 0
  }
  
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.ceil((endTime - now) / msPerDay)
}

/**
 * Formatea el precio para mostrar al usuario
 */
export function formatSubscriptionPrice(subscription: Subscription): string {
  const amount = subscription.amountCents / 100
  
  // Formatear según la moneda
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: subscription.currency.toUpperCase(),
  })
  
  return formatter.format(amount)
}

/**
 * Obtiene el texto descriptivo del intervalo de facturación
 */
export function getBillingIntervalText(
  interval: BillingInterval,
  locale: string = 'en'
): string {
  const translations: Record<string, Record<BillingInterval, string>> = {
    en: {
      month: 'per month',
      year: 'per year',
    },
    es: {
      month: 'al mes',
      year: 'al año',
    },
    fr: {
      month: 'par mois',
      year: 'par an',
    },
    de: {
      month: 'pro Monat',
      year: 'pro Jahr',
    },
  }
  
  return translations[locale]?.[interval] || translations.en[interval]
}

/**
 * DTO para crear una suscripción desde Stripe webhook
 */
export interface CreateSubscriptionFromStripeDTO {
  stripeSubscriptionId: string
  stripeCustomerId: string
  userId: string
  planId: string
  stripePriceId: string
  status: SubscriptionStatus
  amountCents: number
  currency: string
  billingInterval: BillingInterval
  currentPeriodStart: number  // Unix timestamp
  currentPeriodEnd: number    // Unix timestamp
  trialStart?: number
  trialEnd?: number
  cancelAt?: number
  canceledAt?: number
}

/**
 * Convierte un DTO de Stripe a una Subscription entity
 */
export function createSubscriptionFromStripeWebhook(
  dto: CreateSubscriptionFromStripeDTO
): Subscription {
  return createSubscription({
    id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generar ID temporal
    userId: dto.userId,
    stripeSubscriptionId: dto.stripeSubscriptionId,
    stripeCustomerId: dto.stripeCustomerId,
    planId: dto.planId,
    stripePriceId: dto.stripePriceId,
    status: dto.status,
    amountCents: dto.amountCents,
    currency: dto.currency,
    billingInterval: dto.billingInterval,
    currentPeriodStart: new Date(dto.currentPeriodStart * 1000),
    currentPeriodEnd: new Date(dto.currentPeriodEnd * 1000),
    trialStart: dto.trialStart ? new Date(dto.trialStart * 1000) : undefined,
    trialEnd: dto.trialEnd ? new Date(dto.trialEnd * 1000) : undefined,
    cancelAt: dto.cancelAt ? new Date(dto.cancelAt * 1000) : undefined,
    canceledAt: dto.canceledAt ? new Date(dto.canceledAt * 1000) : undefined,
  })
}

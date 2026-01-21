/**
 * Subscription Plan Entity
 * 
 * Define los planes de suscripción disponibles para usuarios premium.
 * Cada plan tiene características específicas y beneficios.
 */

/**
 * Tipo de plan
 */
export type PlanType = 'free' | 'basic' | 'premium' | 'enterprise'

/**
 * Características disponibles
 */
export interface PlanFeatures {
  // Ads
  showAds: boolean                // Si muestra anuncios
  adFrequencyCap?: number         // Max ads por hora (undefined = sin límite)
  
  // Audio Quality
  maxBitrate: number              // kbps (128, 256, 320)
  
  // Stations
  maxFavorites: number            // Máximo de favoritos (0 = unlimited)
  canCreatePlaylists: boolean     // Puede crear playlists personalizadas
  
  // Analytics
  hasListeningHistory: boolean    // Acceso a historial de escucha
  hasRecommendations: boolean     // Recomendaciones personalizadas
  
  // Support
  supportPriority: 'low' | 'medium' | 'high'
  hasPrioritySupport: boolean
  
  // Extras
  canDownloadOffline: boolean     // Descarga para escuchar offline
  hasExclusiveContent: boolean    // Acceso a contenido exclusivo
  maxDevices: number              // Dispositivos simultáneos
}

/**
 * Entidad SubscriptionPlan
 */
export interface SubscriptionPlan {
  // Identificación
  id: string                      // ID del plan
  name: string                    // Nombre del plan (Free, Premium, etc.)
  type: PlanType
  
  // Descripción
  description: string
  shortDescription?: string       // Descripción corta para cards
  
  // Precios (en centavos)
  priceMonthly: number            // 0 para free
  priceYearly: number             // 0 para free, o con descuento
  currency: string                // 'usd', 'eur', 'mxn'
  
  // Stripe IDs
  stripePriceIdMonthly?: string   // ID del price en Stripe (mensual)
  stripePriceIdYearly?: string    // ID del price en Stripe (anual)
  stripeProductId?: string        // ID del producto en Stripe
  
  // Características
  features: PlanFeatures
  
  // Marketing
  isPopular: boolean              // Badge de "Most Popular"
  isFeatured: boolean             // Destacar en la UI
  
  // Orden
  sortOrder: number               // Para ordenar en la UI (1, 2, 3...)
  
  // Estado
  isActive: boolean               // Si está disponible para compra
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

/**
 * Factory para crear una nueva entidad SubscriptionPlan
 */
export function createSubscriptionPlan(
  data: Partial<SubscriptionPlan> & Pick<
    SubscriptionPlan,
    'id' | 'name' | 'type' | 'description' | 'features'
  >
): SubscriptionPlan {
  const now = new Date()
  
  return {
    // Required fields
    id: data.id,
    name: data.name,
    type: data.type,
    description: data.description,
    features: data.features,
    
    // Optional fields with defaults
    shortDescription: data.shortDescription,
    priceMonthly: data.priceMonthly || 0,
    priceYearly: data.priceYearly || 0,
    currency: data.currency || 'usd',
    stripePriceIdMonthly: data.stripePriceIdMonthly,
    stripePriceIdYearly: data.stripePriceIdYearly,
    stripeProductId: data.stripeProductId,
    isPopular: data.isPopular || false,
    isFeatured: data.isFeatured || false,
    sortOrder: data.sortOrder || 0,
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
  }
}

/**
 * Planes predefinidos
 */
export const DEFAULT_PLANS: SubscriptionPlan[] = [
  // Plan Free
  createSubscriptionPlan({
    id: 'plan-free',
    name: 'Free',
    type: 'free',
    description: 'Perfect for casual listeners',
    shortDescription: 'Great for trying out',
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'usd',
    features: {
      showAds: true,
      adFrequencyCap: 6, // 6 ads por hora
      maxBitrate: 128,
      maxFavorites: 20,
      canCreatePlaylists: false,
      hasListeningHistory: false,
      hasRecommendations: false,
      supportPriority: 'low',
      hasPrioritySupport: false,
      canDownloadOffline: false,
      hasExclusiveContent: false,
      maxDevices: 1,
    },
    sortOrder: 1,
  }),

  // Plan Premium (mensual)
  createSubscriptionPlan({
    id: 'plan-premium-monthly',
    name: 'Premium',
    type: 'premium',
    description: 'Ad-free listening with premium features',
    shortDescription: 'No ads, high quality',
    priceMonthly: 999, // $9.99
    priceYearly: 0,
    currency: 'usd',
    stripePriceIdMonthly: process.env.STRIPE_PRICE_ID_MONTHLY || '',
    features: {
      showAds: false,
      maxBitrate: 320,
      maxFavorites: 0, // unlimited
      canCreatePlaylists: true,
      hasListeningHistory: true,
      hasRecommendations: true,
      supportPriority: 'high',
      hasPrioritySupport: true,
      canDownloadOffline: true,
      hasExclusiveContent: true,
      maxDevices: 3,
    },
    isPopular: true,
    sortOrder: 2,
  }),

  // Plan Premium (anual con descuento)
  createSubscriptionPlan({
    id: 'plan-premium-yearly',
    name: 'Premium Annual',
    type: 'premium',
    description: 'Save 20% with annual billing',
    shortDescription: 'Best value - 2 months free!',
    priceMonthly: 0,
    priceYearly: 9599, // $95.99 (2 meses gratis)
    currency: 'usd',
    stripePriceIdYearly: process.env.STRIPE_PRICE_ID_YEARLY || '',
    features: {
      showAds: false,
      maxBitrate: 320,
      maxFavorites: 0,
      canCreatePlaylists: true,
      hasListeningHistory: true,
      hasRecommendations: true,
      supportPriority: 'high',
      hasPrioritySupport: true,
      canDownloadOffline: true,
      hasExclusiveContent: true,
      maxDevices: 3,
    },
    isFeatured: true,
    sortOrder: 3,
  }),
]

/**
 * Obtiene un plan por ID
 */
export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return DEFAULT_PLANS.find(plan => plan.id === planId)
}

/**
 * Obtiene un plan por tipo
 */
export function getPlanByType(type: PlanType): SubscriptionPlan | undefined {
  return DEFAULT_PLANS.find(plan => plan.type === type)
}

/**
 * Calcula el ahorro anual
 */
export function calculateYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
  const monthlyTotal = monthlyPrice * 12
  return monthlyTotal - yearlyPrice
}

/**
 * Formatea el precio para mostrar al usuario
 */
export function formatPlanPrice(
  priceCents: number,
  currency: string,
  locale: string = 'en-US'
): string {
  if (priceCents === 0) {
    return 'Free'
  }
  
  const amount = priceCents / 100
  
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  
  return formatter.format(amount)
}

/**
 * Verifica si un plan permite una característica específica
 */
export function hasFeature(
  plan: SubscriptionPlan,
  feature: keyof PlanFeatures
): boolean {
  return !!plan.features[feature]
}

/**
 * Compara dos planes y retorna las diferencias
 */
export function comparePlans(
  plan1: SubscriptionPlan,
  plan2: SubscriptionPlan
): Partial<PlanFeatures> {
  const differences: Partial<PlanFeatures> = {}
  
  const keys = Object.keys(plan1.features) as Array<keyof PlanFeatures>
  
  for (const key of keys) {
    if (plan1.features[key] !== plan2.features[key]) {
      differences[key] = plan2.features[key] as any
    }
  }
  
  return differences
}

/**
 * Obtiene los planes activos ordenados
 */
export function getActivePlans(): SubscriptionPlan[] {
  return DEFAULT_PLANS
    .filter(plan => plan.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Obtiene el plan más popular
 */
export function getPopularPlan(): SubscriptionPlan | undefined {
  return DEFAULT_PLANS.find(plan => plan.isPopular && plan.isActive)
}

/**
 * Obtiene el plan destacado
 */
export function getFeaturedPlan(): SubscriptionPlan | undefined {
  return DEFAULT_PLANS.find(plan => plan.isFeatured && plan.isActive)
}

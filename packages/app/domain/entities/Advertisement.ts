/**
 * Advertisement Entity
 * 
 * Representa un anuncio publicitario en el sistema.
 * Contiene toda la información necesaria para mostrar y trackear un ad.
 */
export interface Advertisement {
  // Identificación
  id: string
  campaignId: string
  
  // Metadata del anuncio
  title: string
  description?: string
  advertiserName: string
  
  // Formato y contenido
  adFormat: 'banner' | 'interstitial' | 'audio' | 'native'
  adType: 'image' | 'video' | 'audio' | 'html'
  
  // Assets
  mediaUrl?: string // URL de imagen/video/audio
  clickUrl: string // URL de destino
  companionBannerUrl?: string // Banner que acompaña audio ad
  
  // Dimensiones (para banners)
  width?: number
  height?: number
  
  // Duración (para audio/video ads)
  durationSeconds?: number
  
  // Targeting
  targetCountries?: string[] // ['US', 'MX', 'ES']
  targetGenres?: string[] // ['rock', 'pop', 'news']
  targetLanguages?: string[] // ['en', 'es', 'de']
  
  // Programación
  startDate: Date
  endDate?: Date // Optional: some campaigns run indefinitely
  dailyBudgetCents?: number
  totalBudgetCents?: number
  
  // Pricing
  cpmRateCents?: number // Cost per mille (1000 impresiones)
  cpcRateCents?: number // Cost per click
  
  // Estado
  status: 'active' | 'paused' | 'completed'
  priority: number // Mayor prioridad = se muestra primero
  
  // Métricas
  impressionsCount: number
  clicksCount: number
  spendCents: number
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

/**
 * Factory para crear una nueva entidad Advertisement
 */
export function createAdvertisement(data: Partial<Advertisement> & Pick<Advertisement, 'id' | 'title' | 'clickUrl' | 'adFormat' | 'adType'>): Advertisement {
  const now = new Date()
  
  return {
    // Required fields
    id: data.id,
    title: data.title,
    clickUrl: data.clickUrl,
    adFormat: data.adFormat,
    adType: data.adType,
    
    // Optional fields with defaults
    campaignId: data.campaignId || '',
    description: data.description,
    advertiserName: data.advertiserName || 'Unknown Advertiser',
    mediaUrl: data.mediaUrl,
    companionBannerUrl: data.companionBannerUrl,
    width: data.width,
    height: data.height,
    durationSeconds: data.durationSeconds,
    targetCountries: data.targetCountries,
    targetGenres: data.targetGenres,
    targetLanguages: data.targetLanguages,
    startDate: data.startDate || now,
    endDate: data.endDate || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // +30 días
    dailyBudgetCents: data.dailyBudgetCents,
    totalBudgetCents: data.totalBudgetCents,
    cpmRateCents: data.cpmRateCents,
    cpcRateCents: data.cpcRateCents,
    status: data.status || 'active',
    priority: data.priority ?? 0,
    impressionsCount: data.impressionsCount ?? 0,
    clicksCount: data.clicksCount ?? 0,
    spendCents: data.spendCents ?? 0,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
  }
}

/**
 * Verifica si el ad está activo y dentro de su periodo de programación
 */
export function isAdvertisementActive(ad: Advertisement): boolean {
  const now = new Date()
  
  return (
    ad.status === 'active' &&
    ad.startDate <= now &&
    (!ad.endDate || ad.endDate >= now) && // If no endDate, runs indefinitely
    (ad.totalBudgetCents === undefined || ad.spendCents < ad.totalBudgetCents)
  )
}

/**
 * Calcula el CTR (Click-Through Rate) del anuncio
 */
export function calculateAdvertisementCTR(ad: Advertisement): number {
  if (ad.impressionsCount === 0) return 0
  return (ad.clicksCount / ad.impressionsCount) * 100
}

/**
 * Calcula el eCPM (effective Cost Per Mille) del anuncio
 */
export function calculateAdvertisementECPM(ad: Advertisement): number {
  if (ad.impressionsCount === 0) return 0
  return (ad.spendCents / ad.impressionsCount) * 1000
}

/**
 * Verifica si el ad hace match con el contexto del usuario
 */
export function doesAdvertisementMatchContext(
  ad: Advertisement,
  context: {
    country?: string
    genres?: string[]
    language?: string
  }
): boolean {
  // Si no hay targeting, el ad es universal
  const hasCountryTargeting = ad.targetCountries && ad.targetCountries.length > 0
  const hasGenreTargeting = ad.targetGenres && ad.targetGenres.length > 0
  const hasLanguageTargeting = ad.targetLanguages && ad.targetLanguages.length > 0
  
  // Verificar país
  if (hasCountryTargeting && context.country) {
    if (!ad.targetCountries!.includes(context.country)) {
      return false
    }
  }
  
  // Verificar géneros
  if (hasGenreTargeting && context.genres && context.genres.length > 0) {
    const hasGenreMatch = context.genres.some(genre => 
      ad.targetGenres!.includes(genre)
    )
    if (!hasGenreMatch) {
      return false
    }
  }
  
  // Verificar idioma
  if (hasLanguageTargeting && context.language) {
    if (!ad.targetLanguages!.includes(context.language)) {
      return false
    }
  }
  
  return true
}

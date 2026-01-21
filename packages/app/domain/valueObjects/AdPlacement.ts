/**
 * AdPlacement Value Object
 * 
 * Define los lugares donde se pueden mostrar anuncios en la app.
 */
export type AdPlacement = 
  // Banner placements
  | 'home_banner'
  | 'search_banner'
  | 'station_list_banner'
  | 'player_banner'
  
  // Native placements
  | 'search_native'
  | 'station_list_native'
  
  // Audio placements
  | 'audio_pre_roll'
  | 'audio_mid_roll'
  
  // Interstitial placements
  | 'interstitial_startup'
  | 'interstitial_between_stations'

/**
 * Configuración de frequency capping por placement
 * Define con qué frecuencia se pueden mostrar ads en cada placement
 */
export const AD_FREQUENCY_CAPPING = {
  // Banners - pueden mostrarse con más frecuencia
  home_banner: {
    maxPerSession: 3,
    minIntervalSeconds: 300, // 5 minutos entre impresiones
  },
  search_banner: {
    maxPerSession: 2,
    minIntervalSeconds: 600, // 10 minutos
  },
  station_list_banner: {
    maxPerSession: 5,
    minIntervalSeconds: 180, // 3 minutos
  },
  player_banner: {
    maxPerSession: 2,
    minIntervalSeconds: 900, // 15 minutos
  },
  
  // Native ads - moderadamente frecuentes
  search_native: {
    maxPerSession: 3,
    minIntervalSeconds: 300, // 5 minutos
  },
  station_list_native: {
    maxPerSession: 3,
    minIntervalSeconds: 300, // 5 minutos
  },
  
  // Audio ads - menos frecuentes (más intrusivos)
  audio_pre_roll: {
    maxPerSession: 2,
    minIntervalSeconds: 1800, // 30 minutos
  },
  audio_mid_roll: {
    maxPerSession: 3,
    minIntervalSeconds: 600, // 10 minutos
  },
  
  // Interstitials - muy poco frecuentes (más intrusivos)
  interstitial_startup: {
    maxPerSession: 1,
    minIntervalSeconds: 86400, // 1 día
  },
  interstitial_between_stations: {
    maxPerSession: 1,
    minIntervalSeconds: 3600, // 1 hora
  },
} as const

/**
 * Prioridad de placements (mayor valor = mayor prioridad para revenue)
 */
export const AD_PLACEMENT_PRIORITY = {
  // Audio tiene mayor prioridad (más valuable)
  audio_pre_roll: 100,
  audio_mid_roll: 90,
  
  // Interstitials
  interstitial_startup: 80,
  interstitial_between_stations: 70,
  
  // Banners en posiciones premium
  home_banner: 60,
  player_banner: 55,
  
  // Native ads
  search_native: 50,
  station_list_native: 45,
  
  // Banners en posiciones secundarias
  search_banner: 40,
  station_list_banner: 30,
} as const

/**
 * Verifica si un placement es válido
 */
export function isValidAdPlacement(placement: string): placement is AdPlacement {
  return placement in AD_FREQUENCY_CAPPING
}

/**
 * Obtiene el formato de ad apropiado para un placement
 */
export function getAdFormatForPlacement(placement: AdPlacement): 'banner' | 'native' | 'audio' | 'interstitial' {
  if (placement.includes('banner')) return 'banner'
  if (placement.includes('native')) return 'native'
  if (placement.includes('audio')) return 'audio'
  if (placement.includes('interstitial')) return 'interstitial'
  
  return 'banner' // fallback
}

/**
 * Verifica si se puede mostrar un ad en un placement específico
 */
export function canShowAdInPlacement(
  placement: AdPlacement,
  lastImpressionTime: Date | null,
  sessionImpressions: number
): boolean {
  const config = AD_FREQUENCY_CAPPING[placement]
  
  // Verificar máximo por sesión
  if (sessionImpressions >= config.maxPerSession) {
    return false
  }
  
  // Verificar intervalo mínimo
  if (lastImpressionTime) {
    const secondsSinceLastImpression = (Date.now() - lastImpressionTime.getTime()) / 1000
    if (secondsSinceLastImpression < config.minIntervalSeconds) {
      return false
    }
  }
  
  return true
}

/**
 * Obtiene el próximo momento en que se puede mostrar un ad
 */
export function getNextAvailableAdTime(
  placement: AdPlacement,
  lastImpressionTime: Date | null
): Date {
  if (!lastImpressionTime) {
    return new Date() // Disponible ahora
  }
  
  const config = AD_FREQUENCY_CAPPING[placement]
  const nextAvailableMs = lastImpressionTime.getTime() + (config.minIntervalSeconds * 1000)
  
  return new Date(nextAvailableMs)
}

/**
 * Obtiene los placements más valiosos ordenados por prioridad
 */
export function getPlacementsByPriority(): AdPlacement[] {
  return Object.entries(AD_PLACEMENT_PRIORITY)
    .sort(([, a], [, b]) => b - a)
    .map(([placement]) => placement as AdPlacement)
}

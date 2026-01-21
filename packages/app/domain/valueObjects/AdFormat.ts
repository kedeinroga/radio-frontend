/**
 * AdFormat Value Object
 * 
 * Define los formatos de anuncios soportados por el sistema.
 */
export type AdFormat = 'banner' | 'interstitial' | 'audio' | 'native'

/**
 * Dimensiones estándar para banners según IAB
 */
export const AD_BANNER_SIZES = {
  // Mobile
  MOBILE_BANNER: { width: 320, height: 50 },
  MOBILE_LEADERBOARD: { width: 320, height: 100 },
  MOBILE_MEDIUM_RECTANGLE: { width: 300, height: 250 },
  
  // Desktop
  LEADERBOARD: { width: 728, height: 90 },
  MEDIUM_RECTANGLE: { width: 300, height: 250 },
  WIDE_SKYSCRAPER: { width: 160, height: 600 },
  HALF_PAGE: { width: 300, height: 600 },
  LARGE_RECTANGLE: { width: 336, height: 280 },
  
  // Responsive
  RESPONSIVE: { width: undefined, height: undefined },
} as const

/**
 * Duración recomendada para audio ads según IAB
 */
export const AUDIO_AD_DURATION = {
  SHORT: 15, // 15 segundos
  STANDARD: 30, // 30 segundos (recomendado)
  LONG: 60, // 60 segundos
} as const

/**
 * Verifica si un formato es válido
 */
export function isValidAdFormat(format: string): format is AdFormat {
  return ['banner', 'interstitial', 'audio', 'native'].includes(format)
}

/**
 * Obtiene las dimensiones recomendadas para un banner
 */
export function getRecommendedBannerSize(
  placement: 'home_top' | 'search_top' | 'station_list' | 'player_bottom',
  isMobile: boolean
): { width?: number; height?: number } {
  // Banners móviles
  if (isMobile) {
    switch (placement) {
      case 'home_top':
      case 'search_top':
        return AD_BANNER_SIZES.MOBILE_LEADERBOARD
      case 'station_list':
        return AD_BANNER_SIZES.MOBILE_MEDIUM_RECTANGLE
      case 'player_bottom':
        return AD_BANNER_SIZES.MOBILE_BANNER
      default:
        return AD_BANNER_SIZES.MOBILE_BANNER
    }
  }
  
  // Banners desktop
  switch (placement) {
    case 'home_top':
    case 'search_top':
      return AD_BANNER_SIZES.LEADERBOARD
    case 'station_list':
      return AD_BANNER_SIZES.MEDIUM_RECTANGLE
    case 'player_bottom':
      return AD_BANNER_SIZES.LEADERBOARD
    default:
      return AD_BANNER_SIZES.LEADERBOARD
  }
}

/**
 * Obtiene la duración recomendada para audio ads según placement
 */
export function getRecommendedAudioDuration(
  placement: 'pre_roll' | 'mid_roll'
): number {
  switch (placement) {
    case 'pre_roll':
      return AUDIO_AD_DURATION.SHORT // 15s para no interrumpir mucho
    case 'mid_roll':
      return AUDIO_AD_DURATION.STANDARD // 30s estándar
    default:
      return AUDIO_AD_DURATION.STANDARD
  }
}

/**
 * UserAdProfile Entity
 * 
 * Perfil publicitario del usuario para targeting y frequency capping.
 */
export interface UserAdProfile {
  // Identificación
  id: string
  userId: string
  
  // Preferencias inferidas
  favoriteGenres: string[]
  favoriteCountries: string[]
  listeningTimes: Record<number, number> // { hour: count } para targeting temporal
  
  // Comportamiento publicitario
  totalAdImpressions: number
  totalAdClicks: number
  lastAdShownAt?: Date
  
  // Frequency capping
  adsShownToday: number
  adsShownThisHour: number
  
  // Suscripción premium
  isPremium: boolean
  premiumUntil?: Date
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
}

/**
 * Factory para crear un nuevo perfil de usuario
 */
export function createUserAdProfile(
  data: Partial<UserAdProfile> & Pick<UserAdProfile, 'id' | 'userId'>
): UserAdProfile {
  const now = new Date()
  
  return {
    id: data.id,
    userId: data.userId,
    favoriteGenres: data.favoriteGenres || [],
    favoriteCountries: data.favoriteCountries || [],
    listeningTimes: data.listeningTimes || {},
    totalAdImpressions: data.totalAdImpressions ?? 0,
    totalAdClicks: data.totalAdClicks ?? 0,
    lastAdShownAt: data.lastAdShownAt,
    adsShownToday: data.adsShownToday ?? 0,
    adsShownThisHour: data.adsShownThisHour ?? 0,
    isPremium: data.isPremium ?? false,
    premiumUntil: data.premiumUntil,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
  }
}

/**
 * Verifica si el usuario tiene suscripción premium activa
 */
export function hasActivePremiumSubscription(profile: UserAdProfile): boolean {
  if (!profile.isPremium) return false
  if (!profile.premiumUntil) return true // Premium de por vida
  
  return profile.premiumUntil > new Date()
}

/**
 * Calcula el CTR (Click-Through Rate) del usuario
 */
export function calculateUserCTR(profile: UserAdProfile): number {
  if (profile.totalAdImpressions === 0) return 0
  return (profile.totalAdClicks / profile.totalAdImpressions) * 100
}

/**
 * Verifica si el usuario ha alcanzado el límite de ads por hora
 */
export function hasUserReachedHourlyAdLimit(
  profile: UserAdProfile,
  maxAdsPerHour: number = 10
): boolean {
  return profile.adsShownThisHour >= maxAdsPerHour
}

/**
 * Verifica si el usuario ha alcanzado el límite de ads por día
 */
export function hasUserReachedDailyAdLimit(
  profile: UserAdProfile,
  maxAdsPerDay: number = 50
): boolean {
  return profile.adsShownToday >= maxAdsPerDay
}

/**
 * Obtiene la hora de escucha favorita del usuario
 */
export function getUserFavoriteListeningHour(profile: UserAdProfile): number | null {
  const entries = Object.entries(profile.listeningTimes)
  if (entries.length === 0) return null
  
  let maxHour = 0
  let maxCount = 0
  
  for (const [hour, count] of entries) {
    if (count > maxCount) {
      maxCount = count
      maxHour = parseInt(hour, 10)
    }
  }
  
  return maxHour
}

/**
 * Incrementa el contador de ads mostrados
 */
export function incrementUserAdCounters(profile: UserAdProfile): UserAdProfile {
  return {
    ...profile,
    totalAdImpressions: profile.totalAdImpressions + 1,
    adsShownToday: profile.adsShownToday + 1,
    adsShownThisHour: profile.adsShownThisHour + 1,
    lastAdShownAt: new Date(),
    updatedAt: new Date(),
  }
}

/**
 * Resetea el contador de ads por hora (ejecutar cada hora)
 */
export function resetUserHourlyAdCounter(profile: UserAdProfile): UserAdProfile {
  return {
    ...profile,
    adsShownThisHour: 0,
    updatedAt: new Date(),
  }
}

/**
 * Resetea el contador de ads por día (ejecutar cada día)
 */
export function resetUserDailyAdCounter(profile: UserAdProfile): UserAdProfile {
  return {
    ...profile,
    adsShownToday: 0,
    updatedAt: new Date(),
  }
}

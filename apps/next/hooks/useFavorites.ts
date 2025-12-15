import { Station } from '@radio-app/app'

const FAVORITES_KEY = 'radio-app-favorites'

export const useFavorites = () => {
  const getFavorites = (): Station[] => {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (!stored) return []

      const parsed = JSON.parse(stored)
      return parsed.map((data: any) =>
        new Station(
          data.id,
          data.name,
          data.streamUrl,
          data.imageUrl,
          data.country,
          data.genre,
          data.isPremium,
          data.description,
          data.bitrate
        )
      )
    } catch (error) {
      console.error('Error loading favorites:', error)
      return []
    }
  }

  const isFavorite = (stationId: string): boolean => {
    const favorites = getFavorites()
    return favorites.some(s => s.id === stationId)
  }

  const addFavorite = (station: Station): void => {
    const favorites = getFavorites()

    // Don't add if already exists
    if (favorites.some(s => s.id === station.id)) return

    const updated = [...favorites, station]

    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error('Error saving favorite:', error)
    }
  }

  const removeFavorite = (stationId: string): void => {
    const favorites = getFavorites()
    const updated = favorites.filter(s => s.id !== stationId)

    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  const toggleFavorite = (station: Station): void => {
    if (isFavorite(station.id)) {
      removeFavorite(station.id)
    } else {
      addFavorite(station)
    }
  }

  return {
    getFavorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  }
}

import { useCallback, useEffect, useState } from 'react'
import { Station } from '@radio-app/app'

const FAVORITES_KEY = 'radio-app-favorites'

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Station[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize on mount (Client only) - avoids hydration mismatch
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const stations = parsed.map((data: any) =>
          new Station(
            data.id,
            data.name,
            data.streamUrl,
            data.slug || data.id,
            data.tags || [],
            data.seoMetadata,
            data.imageUrl,
            data.country,
            data.genre,
            data.isPremium || false,
            data.description,
            data.bitrate,
            data.votes
          )
        )
        setFavorites(stations)
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Persist to localStorage whenever favorites change
  useEffect(() => {
    if (!isInitialized) return
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    } catch (error) {
      console.error('Error saving favorites:', error)
    }
  }, [favorites, isInitialized])

  // Get favorites is now just returning the state
  const getFavorites = useCallback((): Station[] => {
    return favorites
  }, [favorites])

  const isFavorite = useCallback((stationId: string): boolean => {
    return favorites.some(s => s.id === stationId)
  }, [favorites])

  const addFavorite = useCallback((station: Station): void => {
    setFavorites(prev => {
      if (prev.some(s => s.id === station.id)) return prev
      return [...prev, station]
    })
  }, [])

  const removeFavorite = useCallback((stationId: string): void => {
    setFavorites(prev => prev.filter(s => s.id !== stationId))
  }, [])

  const toggleFavorite = useCallback((station: Station): void => {
    setFavorites(prev => {
      const exists = prev.some(s => s.id === station.id)
      if (exists) {
        return prev.filter(s => s.id !== station.id)
      } else {
        return [...prev, station]
      }
    })
  }, [])

  return {
    favorites, // Expose raw list if needed
    isInitialized, // Expose loading state
    getFavorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  }
}

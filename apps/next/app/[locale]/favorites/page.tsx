'use client'

import { useState, useEffect } from 'react'
import { Heart, Trash2 } from 'lucide-react'
import { StationCard } from '@/components/StationCard'
import { EmptyState } from '@/components/EmptyState'
import { usePlayer } from '@/hooks/usePlayer'
import { useFavorites } from '@/hooks/useFavorites'
import { useAppTranslation } from '@/hooks/useAppTranslation'

export default function FavoritesPage() {
  const { play, togglePlayPause, currentStation, playerState } = usePlayer()
  const { favorites, isInitialized, removeFavorite } = useFavorites()
  const { t } = useAppTranslation()

  if (!isInitialized) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </main>
    )
  }

  const handlePlay = (station: any) => {
    // If clicking on the current station, toggle play/pause
    if (currentStation?.id === station.id) {
      togglePlayPause()
    } else {
      // Otherwise, play the new station
      play(station)
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary-500 fill-current" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('favorites.stationsFavorites')}
            </h1>
          </div>
          {favorites.length > 0 && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {favorites.length} {favorites.length === 1 ? t('favorites.favorite') : t('favorites.favorites_other')}
            </span>
          )}
        </div>

        {/* Favorites List */}
        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((station) => (
              <div key={station.id} className="relative group">
                <StationCard
                  station={station}
                  onPlay={() => handlePlay(station)}
                  isPlaying={currentStation?.id === station.id && playerState.isPlaying}
                  isBuffering={currentStation?.id === station.id && playerState.isBuffering}
                />
                
                {/* Remove button */}
                <button
                  onClick={() => removeFavorite(station.id)}
                  className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label={t('favorites.removeFavorite', { name: station.name })}
                  title={t('favorites.removeFromFavoritesShort')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="❤️"
            title={t('favorites.noFavoritesTitle')}
            message={t('favorites.noFavoritesDescription')}
          />
        )}
      </div>
    </main>
  )
}

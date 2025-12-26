'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { StationApiRepository } from '@radio-app/app'
import { StationCard } from '@/components/StationCard'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { EmptyState } from '@/components/EmptyState'
import { usePlayer } from '@/hooks/usePlayer'
import { useFavorites } from '@/hooks/useFavorites'

const stationRepo = new StationApiRepository()

export default function HomePage() {
  const [, setFavoritesState] = useState(0) // Force re-render on favorite changes
  
  const { data: stations, isLoading, error } = useQuery({
    queryKey: ['popular-stations'],
    queryFn: () => stationRepo.getPopular(20),
  })

  const { play, togglePlayPause, currentStation, playerState } = usePlayer()
  const { isFavorite, toggleFavorite } = useFavorites()

  const handleToggleFavorite = (station: any) => {
    toggleFavorite(station)
    setFavoritesState(prev => prev + 1) // Force re-render
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
    <main id="main-content" className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
            🎵 Radio App
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Stream radio stations from around the world
          </p>
        </header>

        {/* Popular Stations Section */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            Popular Stations
          </h2>

          {isLoading && <LoadingSpinner message="Loading stations..." />}

          {error && (
            <EmptyState
              icon="⚠️"
              title="Error Loading Stations"
              description="Unable to load stations. Please try again later."
              actionLabel="Retry"
              onAction={() => window.location.reload()}
            />
          )}

          {stations && stations.length === 0 && (
            <EmptyState
              icon="📻"
              title="No Stations Found"
              description="We couldn't find any stations at the moment."
            />
          )}

          {stations && stations.length > 0 && (
            <div className="space-y-3">
              {stations.map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  isPlaying={currentStation?.id === station.id && playerState.isPlaying}
                  isBuffering={currentStation?.id === station.id && playerState.isBuffering}
                  isFavorite={isFavorite(station.id)}
                  onPlay={() => handlePlay(station)}
                  onFavorite={() => handleToggleFavorite(station)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

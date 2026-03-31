'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { StationApiRepository } from '@radio-app/app'
import { StationCard } from '@/components/StationCard'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { EmptyState } from '@/components/EmptyState'
import { usePlayer } from '@/hooks/usePlayer'
import { useFavorites } from '@/hooks/useFavorites'
import { useAppTranslation } from '@/hooks/useAppTranslation'

interface PopularStationsProps {
  initialStations: any[]
}

const stationRepo = new StationApiRepository()

/**
 * PopularStations Client Component
 * 
 * Handles interactive features (play, favorite) while using SSR data
 * for initial render and SEO optimization.
 */
export function PopularStations({ initialStations }: PopularStationsProps) {
  const [, setFavoritesState] = useState(0) // Force re-render on favorite changes
  const { t } = useAppTranslation()
  
  // Use initialStations from SSR as default data
  const { data: stations, isLoading, error } = useQuery({
    queryKey: ['popular-stations'],
    queryFn: () => stationRepo.getPopular(20),
    initialData: initialStations,
    staleTime: 5 * 60 * 1000, // 5 minutes - reduces unnecessary refetches
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
    <section>
      <div className="flex items-center gap-4 mb-5">
        <h2 className="font-broadcast text-[11px] tracking-[0.2em] uppercase text-neutral-500 whitespace-nowrap">
          {t('stations.popular')}
        </h2>
        <div className="flex-1 h-px bg-white/[0.06]" aria-hidden="true" />
      </div>

      {isLoading && <LoadingSpinner message={t('stations.loadingStations')} />}

      {error && (
        <EmptyState
          icon="⚠️"
          title={t('stations.errorLoading')}
          description={t('stations.errorDescription')}
          actionLabel={t('common.retry')}
          onAction={() => window.location.reload()}
        />
      )}

      {stations && stations.length === 0 && (
        <EmptyState
          icon="📻"
          title={t('stations.noStations')}
          description={t('stations.noStationsDescription')}
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
  )
}

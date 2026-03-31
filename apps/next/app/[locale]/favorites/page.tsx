'use client'

import { Heart, Trash2 } from 'lucide-react'
import { StationCard } from '@/components/StationCard'
import { EmptyState } from '@/components/EmptyState'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { usePlayer } from '@/hooks/usePlayer'
import { useFavorites } from '@/hooks/useFavorites'
import { useAppTranslation } from '@/hooks/useAppTranslation'

export default function FavoritesPage() {
  const { play, togglePlayPause, currentStation, playerState } = usePlayer()
  const { favorites, isInitialized, removeFavorite } = useFavorites()
  const { t } = useAppTranslation()

  if (!isInitialized) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </main>
    )
  }

  const handlePlay = (station: any) => {
    if (currentStation?.id === station.id) {
      togglePlayPause()
    } else {
      play(station)
    }
  }

  return (
    <main id="main-content" className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">

        {/* ── Page header ────────────────────────────────── */}
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" aria-hidden="true" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white">
              {t('favorites.stationsFavorites')}
            </h1>
          </div>

          {favorites.length > 0 && (
            <span className="font-broadcast text-[11px] text-neutral-500 tracking-wide">
              {favorites.length}{' '}
              {favorites.length === 1
                ? t('favorites.favorite')
                : t('favorites.favorites_other')}
            </span>
          )}
        </header>

        {/* ── List ───────────────────────────────────────── */}
        {favorites.length > 0 ? (
          <div className="space-y-2">
            {favorites.map((station, i) => (
              <div
                key={station.id}
                className="relative group animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <StationCard
                  station={station}
                  onPlay={() => handlePlay(station)}
                  isPlaying={currentStation?.id === station.id && playerState.isPlaying}
                  isBuffering={currentStation?.id === station.id && playerState.isBuffering}
                />

                {/* Remove button — appears on hover */}
                <button
                  onClick={() => removeFavorite(station.id)}
                  className="
                    absolute top-1/2 -translate-y-1/2 right-3
                    w-7 h-7 rounded-lg flex items-center justify-center
                    bg-neutral-800 hover:bg-rose-500/20
                    border border-white/[0.07] hover:border-rose-500/30
                    text-neutral-600 hover:text-rose-400
                    opacity-0 group-hover:opacity-100
                    transition-all duration-200
                    focus:opacity-100 focus:outline-none
                  "
                  aria-label={t('favorites.removeFavorite', { name: station.name })}
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
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

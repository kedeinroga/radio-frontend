'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Station } from '@radio-app/app'
import { useAppTranslation } from '@/hooks/useAppTranslation'

export interface StationCardProps {
  station: Station
  isFavorite?: boolean
  isPlaying?: boolean
  isBuffering?: boolean
  onPlay: () => void
  onFavorite?: () => void
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  isFavorite = false,
  isPlaying = false,
  isBuffering = false,
  onPlay,
  onFavorite,
}) => {
  const router = useRouter()
  const { t } = useAppTranslation()

  const handleCardClick = () => {
    // On small screens, clicking the card plays/pauses the station
    // On larger screens, it navigates to the station detail page
    if (window.innerWidth < 640) {
      onPlay()
    } else {
      router.push(`/radio/${station.id}`)
    }
  }

  const [imgError, setImgError] = React.useState(false)

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-neutral-900 rounded-xl p-4 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {/* Station Image */}
        <div className="w-20 h-20 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center overflow-hidden flex-shrink-0">
          {!imgError && station.imageUrl ? (
            <img
              src={station.imageUrl}
              alt={`${station.name} logo`}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
              <span className="text-3xl text-white">📻</span>
            </div>
          )}
        </div>

        {/* Station Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white truncate">
              {station.name}
            </h3>
            {station.isPremium && (
              <span className="bg-warning px-2 py-0.5 rounded text-xs font-semibold text-white flex-shrink-0">
                PRO
              </span>
            )}
          </div>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
            {station.country || t('stations.unknownCountry')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Play Button - Hidden on small screens */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPlay()
            }}
            disabled={isBuffering}
            aria-label={isPlaying ? t('player.pauseStation', { name: station.name }) : t('player.playStation', { name: station.name })}
            className="hidden sm:flex w-12 h-12 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 rounded-full items-center justify-center text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            {isBuffering ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="text-xl">{isPlaying ? '⏸' : '▶'}</span>
            )}
          </button>

          {/* Favorite Button - Only show if onFavorite is provided */}
          {onFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onFavorite()
              }}
              aria-label={isFavorite ? t('favorites.removeFromFavorites') : t('favorites.addToFavorites')}
              className="w-12 h-12 flex items-center justify-center transition-colors focus:outline-none"
            >
              <svg
                className="w-6 h-6 text-red-500 hover:scale-110 transition-transform"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Station } from '@radio-app/app'

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

  const handleCardClick = () => {
    router.push(`/stations/${station.id}`)
  }

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-neutral-900 rounded-xl p-4 mb-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center gap-4">
        {/* Station Image */}
        <img
          src={station.imageUrl || 'https://via.placeholder.com/80'}
          alt={`${station.name} logo`}
          className="w-20 h-20 rounded-lg bg-neutral-200 object-cover"
        />

        {/* Station Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white truncate">
              {station.name}
            </h3>
            {station.isPremium && (
              <span className="bg-warning px-2 py-0.5 rounded text-xs font-semibold text-white">
                PRO
              </span>
            )}
          </div>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
            {station.country || 'Unknown'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Play Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPlay()
            }}
            disabled={isBuffering}
            aria-label={isPlaying ? 'Pause station' : 'Play station'}
            className="w-12 h-12 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 rounded-full flex items-center justify-center text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span className="text-xl">{isFavorite ? '❤️' : '🤍'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

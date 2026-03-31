'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Station } from '@radio-app/app'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { Heart, Play, Pause, Radio } from 'lucide-react'

/** Animated waveform for playing state */
const WaveformBars = () => (
  <div className="flex items-end gap-[2px] h-4 w-7 flex-shrink-0" aria-hidden="true">
    {[1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        className="wave-bar flex-1 rounded-[1px] bg-amber-500"
        style={{ height: '100%' }}
      />
    ))}
  </div>
)

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
  const [imgError, setImgError] = React.useState(false)

  const handleCardClick = () => {
    if (window.innerWidth < 640) {
      onPlay()
    } else {
      router.push(`/radio/${station.id}`)
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className={`
        relative group cursor-pointer rounded-xl overflow-hidden
        transition-all duration-300
        bg-neutral-900 dark:bg-surface-900
        border
        ${isPlaying
          ? 'border-amber-500/30 shadow-[0_0_24px_-4px_rgba(245,163,10,0.2)]'
          : 'border-white/[0.06] hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/20'
        }
      `}
    >
      {/* Left accent strip */}
      <div
        className={`
          absolute left-0 top-0 bottom-0 w-[3px] rounded-full transition-all duration-300
          ${isPlaying ? 'bg-amber-500' : 'bg-transparent group-hover:bg-white/10'}
        `}
      />

      <div className="flex items-center gap-4 px-4 py-3 pl-5">
        {/* Station image */}
        <div
          className={`
            relative w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden
            transition-all duration-300
            ${isPlaying
              ? 'ring-2 ring-amber-500/70 ring-offset-2 ring-offset-surface-900'
              : 'ring-1 ring-white/[0.06]'
            }
          `}
        >
          {!imgError && station.imageUrl ? (
            <img
              src={station.imageUrl}
              alt={`${station.name} logo`}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-800">
              <Radio className="w-6 h-6 text-neutral-500" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Station info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={`
                font-display text-base font-semibold truncate transition-colors duration-200
                ${isPlaying
                  ? 'text-amber-400'
                  : 'text-neutral-100 group-hover:text-white'
                }
              `}
            >
              {station.name}
            </h3>
            {station.isPremium && (
              <span className="flex-shrink-0 bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded text-[9px] font-broadcast font-bold tracking-widest border border-amber-500/25">
                PRO
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isPlaying ? (
              <>
                <WaveformBars />
                <span className="font-broadcast text-[11px] text-neutral-500 truncate">
                  {station.country || 'Live'}
                </span>
              </>
            ) : (
              <p className="font-broadcast text-[11px] text-neutral-500 truncate">
                {station.country || t('stations.unknownCountry')}
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div
          className="flex items-center gap-1.5 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Play button — hidden on mobile */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onPlay()
            }}
            disabled={isBuffering}
            aria-label={
              isPlaying
                ? t('player.pauseStation', { name: station.name })
                : t('player.playStation', { name: station.name })
            }
            className={`
              hidden sm:flex w-10 h-10 rounded-full items-center justify-center
              transition-all duration-200 focus:outline-none
              focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-neutral-900
              ${isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-neutral-900 shadow-[0_0_14px_rgba(245,163,10,0.45)]'
                : 'bg-white/[0.07] hover:bg-white/[0.14] text-neutral-300 border border-white/10'
              }
            `}
          >
            {isBuffering ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" aria-hidden="true" />
            )}
          </button>

          {/* Favorite button */}
          {onFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onFavorite()
              }}
              aria-label={
                isFavorite
                  ? t('favorites.removeFromFavorites')
                  : t('favorites.addToFavorites')
              }
              className="w-10 h-10 flex items-center justify-center focus:outline-none rounded-full"
            >
              <Heart
                className={`w-4 h-4 transition-all duration-200 ${
                  isFavorite
                    ? 'text-rose-500 fill-rose-500 scale-110'
                    : 'text-neutral-600 hover:text-rose-400 hover:scale-110'
                }`}
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

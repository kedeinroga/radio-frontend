'use client'

import { usePlayer } from '@/hooks/usePlayer'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react'
import Image from 'next/image'

/** Compact waveform visualizer */
const MiniWaveform = ({ isPlaying }: { isPlaying: boolean }) => (
  <div className="flex items-end gap-[2px] h-3.5 w-6 flex-shrink-0" aria-hidden="true">
    {[1, 2, 3, 4].map((i) => (
      <span
        key={i}
        className={`flex-1 rounded-[1px] transition-colors duration-300 ${
          isPlaying ? 'wave-bar bg-amber-500' : 'bg-neutral-600'
        }`}
        style={{
          height: '100%',
          ...(isPlaying
            ? {}
            : { transform: `scaleY(${0.25 + i * 0.18})`, transformOrigin: 'bottom' }),
        }}
      />
    ))}
  </div>
)

export function PlayerBar() {
  const { t } = useAppTranslation()
  const { currentStation, playerState, togglePlayPause, stop, setVolume } = usePlayer()
  const router = useRouter()
  const pathname = usePathname()
  const [imgError, setImgError] = useState(false)

  if (!currentStation) return null

  const isOnStationDetailPage =
    pathname?.includes(`/radio/${currentStation.id}`) ||
    pathname?.includes(`/stations/${currentStation.id}`)

  if (isOnStationDetailPage) return null

  const handleStationClick = () => {
    if (currentStation?.id) {
      router.push(`/radio/${currentStation.id}`)
    }
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-50 px-3 pb-1.5">
      <div className="max-w-2xl mx-auto lg:max-w-3xl">
        <div
          className={`
            rounded-2xl overflow-hidden
            bg-neutral-900/85 backdrop-blur-2xl
            border border-white/[0.07]
            transition-shadow duration-500
            ${playerState.isPlaying
              ? 'shadow-[0_-2px_32px_-4px_rgba(0,0,0,0.6),0_0_0_1px_rgba(245,163,10,0.12)]'
              : 'shadow-[0_-2px_24px_-4px_rgba(0,0,0,0.5)]'
            }
          `}
        >
          {/* Amber shimmer bar at top when playing */}
          <div
            className={`h-[2px] transition-opacity duration-500 ${
              playerState.isPlaying ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, #F5A30A 30%, #FBBF24 50%, #F5A30A 70%, transparent 100%)',
            }}
          />

          <div className="flex items-center gap-3 px-4 py-3">
            {/* Station info — clickable */}
            <button
              onClick={handleStationClick}
              className="flex items-center gap-3 flex-1 min-w-0 text-left focus:outline-none group"
              aria-label={t('player.viewDetails', { name: currentStation.name })}
            >
              {/* Thumbnail */}
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-white/[0.08]">
                {!imgError && currentStation.imageUrl ? (
                  <img
                    src={currentStation.imageUrl}
                    alt={currentStation.name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <Image
                    src="/icon-192.png"
                    alt="Rradio"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Live dot */}
                {playerState.isPlaying && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500 live-pulse" />
                )}
              </div>

              {/* Name + waveform */}
              <div className="flex-1 min-w-0">
                <p
                  className={`
                    font-display text-sm font-semibold truncate transition-colors duration-200
                    ${playerState.isPlaying
                      ? 'text-amber-400 group-hover:text-amber-300'
                      : 'text-white group-hover:text-amber-400'
                    }
                  `}
                >
                  {currentStation.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <MiniWaveform isPlaying={playerState.isPlaying} />
                  <p className="font-broadcast text-[10px] text-neutral-500 truncate">
                    {currentStation.country || 'Live Radio'}
                  </p>
                </div>
              </div>
            </button>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Volume — desktop only */}
              <div className="hidden md:flex items-center gap-2 mr-1">
                <button
                  onClick={() =>
                    setVolume((playerState.volume ?? 0.7) === 0 ? 0.7 : 0)
                  }
                  aria-label={
                    (playerState.volume ?? 0.7) === 0
                      ? t('player.unmute')
                      : t('player.mute')
                  }
                  className="text-neutral-500 hover:text-neutral-300 transition-colors focus:outline-none"
                >
                  {(playerState.volume ?? 0.7) === 0 ? (
                    <VolumeX className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={(playerState.volume || 0.7) * 100}
                  onChange={(e) => setVolume(Number(e.target.value) / 100)}
                  aria-label={t('player.volume')}
                  className="w-16 h-1 rounded-full appearance-none cursor-pointer accent-amber-500 bg-neutral-700"
                />
              </div>

              {/* Stop */}
              <button
                onClick={stop}
                aria-label={t('player.stop')}
                className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.06] transition-all duration-200 focus:outline-none"
              >
                <Square className="w-3.5 h-3.5" aria-hidden="true" />
              </button>

              {/* Play / Pause */}
              <button
                onClick={togglePlayPause}
                disabled={playerState.isBuffering}
                aria-label={playerState.isPlaying ? t('player.pause') : t('player.play')}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  transition-all duration-200 focus:outline-none
                  focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-neutral-900
                  disabled:opacity-50
                  ${playerState.isPlaying
                    ? 'bg-amber-500 hover:bg-amber-400 text-neutral-900 shadow-[0_0_18px_rgba(245,163,10,0.45)]'
                    : 'bg-white/[0.10] hover:bg-white/[0.18] text-white border border-white/10'
                  }
                `}
              >
                {playerState.isBuffering ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : playerState.isPlaying ? (
                  <Pause className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

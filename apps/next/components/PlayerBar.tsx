'use client'

import { usePlayer } from '@/hooks/usePlayer'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function PlayerBar() {
  const { currentStation, playerState, togglePlayPause, stop, setVolume } = usePlayer()
  const router = useRouter()
  const [imgError, setImgError] = useState(false)

  if (!currentStation) {
    return null
  }

  const handleStationClick = () => {
    if (currentStation?.id) {
      // Use slug for SEO-friendly URLs
      router.push(`/radio/${currentStation.slug || currentStation.id}`)
    }
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 shadow-lg z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Station Info - Clickable */}
          <button
            onClick={handleStationClick}
            className="flex items-center gap-3 flex-1 min-w-0 text-left hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
            aria-label={`Ver detalles de ${currentStation.name}`}
          >
            <div className="w-12 h-12 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center overflow-hidden flex-shrink-0">
              {!imgError && currentStation.imageUrl ? (
                <img
                  src={currentStation.imageUrl}
                  alt={currentStation.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                  <span className="text-2xl text-white">📻</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                {currentStation.name}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                {currentStation.country || 'Radio Station'}
              </p>
            </div>
          </button>

          {/* Player Controls */}
          <div className="flex items-center gap-3">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              disabled={playerState.isBuffering}
              aria-label={playerState.isPlaying ? 'Pause' : 'Play'}
              className="w-12 h-12 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 rounded-full flex items-center justify-center text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {playerState.isBuffering ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-xl">{playerState.isPlaying ? '⏸' : '▶'}</span>
              )}
            </button>

            {/* Stop Button */}
            <button
              onClick={stop}
              aria-label="Stop"
              className="w-10 h-10 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 rounded-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span className="text-lg">⏹</span>
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 min-w-[120px]">
              <button
                onClick={() => setVolume(playerState.volume === 0 ? 0.7 : 0)}
                aria-label={playerState.volume === 0 ? 'Unmute' : 'Mute'}
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
              >
                <span className="text-xl">
                  {playerState.volume === 0 ? '🔇' : playerState.volume < 0.5 ? '🔉' : '🔊'}
                </span>
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={(playerState.volume || 0.7) * 100}
                onChange={(e) => setVolume(Number(e.target.value) / 100)}
                aria-label="Volume"
                className="w-20 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { usePlayer } from '@/hooks/usePlayer'
import { useAppTranslation } from '@/hooks/useAppTranslation'

// Minimal station info needed for playing
interface StationPlayData {
  id: string
  name: string
  streamUrl: string
  slug: string
  imageUrl?: string
  country?: string
}

interface PlayStationButtonProps {
  station: StationPlayData
}

export function PlayStationButton({ station }: PlayStationButtonProps) {
  const { play, pause, stop, setVolume, currentStation, playerState } = usePlayer()
  const { t } = useAppTranslation()

  const isCurrentStation = currentStation?.id === station.id
  const isPlaying = isCurrentStation && playerState.isPlaying
  const isBuffering = isCurrentStation && playerState.isBuffering

  const handlePlayPause = () => {
    if (isCurrentStation && isPlaying) {
      pause()
    } else {
      play(station)
    }
  }

  return (
    <div className="space-y-4">
      {/* Main Play/Pause Button */}
      <button
        onClick={handlePlayPause}
        disabled={isBuffering}
        className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        aria-label={isPlaying ? t('player.pauseStation', { name: station.name }) : t('player.playStation', { name: station.name })}
      >
        {isBuffering ? (
          <>
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t('common.loading')}
          </>
        ) : isPlaying ? (
          <>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
            {t('player.pause')}
          </>
        ) : (
          <>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            {t('player.play')}
          </>
        )}
      </button>

      {/* Additional Controls - Only show when this station is currently playing */}
      {isCurrentStation && (
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg max-w-2xl">
          {/* Stop Button */}
          <button
            onClick={stop}
            aria-label={t('player.stop')}
            className="w-full sm:w-auto px-6 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 flex-shrink-0"
          >
            <span className="text-lg">⏹</span>
            {t('player.stop')}
          </button>

          {/* Volume Control - Hidden on mobile devices */}
          <div className="hidden md:flex items-center gap-3 flex-1 w-full sm:w-auto sm:max-w-md">
            <button
              onClick={() => setVolume((playerState.volume ?? 0.7) === 0 ? 0.7 : 0)}
              aria-label={(playerState.volume ?? 0.7) === 0 ? t('player.unmute') : t('player.mute')}
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-2 flex-shrink-0"
            >
              <span className="text-2xl">
                {(playerState.volume ?? 0.7) === 0 ? '🔇' : (playerState.volume ?? 0.7) < 0.5 ? '🔉' : '🔊'}
              </span>
            </button>
            <div className="flex-1 flex items-center gap-2 min-w-0">
              <input
                type="range"
                min="0"
                max="100"
                value={(playerState.volume || 0.7) * 100}
                onChange={(e) => setVolume(Number(e.target.value) / 100)}
                aria-label={t('player.volume')}
                className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400 min-w-[3ch] flex-shrink-0">
                {Math.round((playerState.volume || 0.7) * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

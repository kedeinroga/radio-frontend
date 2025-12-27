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
  const { play, pause, currentStation, playerState } = usePlayer()
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
          {t('player.pauseStation', { name: station.name })}
        </>
      ) : (
        <>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          {t('player.playStation', { name: station.name })}
        </>
      )}
    </button>
  )
}

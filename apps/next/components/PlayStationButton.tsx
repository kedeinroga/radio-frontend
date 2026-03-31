'use client'

import { usePlayer } from '@/hooks/usePlayer'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react'

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

/** Waveform bars for the "now playing" state inside the CTA */
const ButtonWaveform = () => (
  <div className="flex items-end gap-[3px] h-5 w-8 flex-shrink-0" aria-hidden="true">
    {[1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        className="wave-bar flex-1 rounded-[2px] bg-neutral-900"
        style={{ height: '100%' }}
      />
    ))}
  </div>
)

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
    <div className="space-y-3 w-full">
      {/* ── Main CTA ─────────────────────────────────────── */}
      <button
        onClick={handlePlayPause}
        disabled={isBuffering}
        aria-label={
          isPlaying
            ? t('player.pauseStation', { name: station.name })
            : t('player.playStation', { name: station.name })
        }
        className={`
          w-full py-4 px-6 rounded-2xl font-broadcast text-sm font-bold tracking-[0.1em] uppercase
          flex items-center justify-center gap-3
          transition-all duration-300 focus:outline-none disabled:opacity-50
          ${isPlaying
            ? 'bg-amber-500 hover:bg-amber-400 text-neutral-900 shadow-[0_0_48px_rgba(245,163,10,0.35)] hover:shadow-[0_0_60px_rgba(245,163,10,0.45)]'
            : 'bg-white/[0.09] hover:bg-white/[0.15] text-white border border-white/[0.12] hover:border-amber-500/35'
          }
        `}
      >
        {isBuffering ? (
          <>
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>{t('common.loading')}</span>
          </>
        ) : isPlaying ? (
          <>
            <ButtonWaveform />
            <Pause className="w-5 h-5" aria-hidden="true" />
            <span>{t('player.pause')}</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5 ml-0.5" aria-hidden="true" />
            <span>{t('player.play')}</span>
          </>
        )}
      </button>

      {/* ── Secondary controls (stop + volume) ───────────── */}
      {isCurrentStation && (
        <div className="flex items-center gap-3">
          <button
            onClick={stop}
            aria-label={t('player.stop')}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 font-broadcast text-[11px] text-neutral-500 hover:text-neutral-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl transition-all focus:outline-none"
          >
            <Square className="w-3 h-3" aria-hidden="true" />
            {t('player.stop')}
          </button>

          <div className="hidden md:flex items-center gap-2.5 flex-1">
            <button
              onClick={() =>
                setVolume((playerState.volume ?? 0.7) === 0 ? 0.7 : 0)
              }
              aria-label={
                (playerState.volume ?? 0.7) === 0
                  ? t('player.unmute')
                  : t('player.mute')
              }
              className="text-neutral-600 hover:text-neutral-300 transition-colors focus:outline-none flex-shrink-0"
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
              className="flex-1 h-[3px] rounded-full appearance-none cursor-pointer accent-amber-500 bg-neutral-700"
            />
            <span className="font-broadcast text-[10px] text-neutral-600 w-[3ch] text-right flex-shrink-0">
              {Math.round((playerState.volume || 0.7) * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

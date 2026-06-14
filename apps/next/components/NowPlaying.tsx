'use client'

import { useQuery } from '@tanstack/react-query'
import { StationApiRepository } from '@radio-app/app'
import type { StationTrack } from '@radio-app/app'
import { useAppTranslation } from '@/hooks/useAppTranslation'

interface NowPlayingProps {
  stationId: string
  initialNowPlaying: StationTrack | null
  initialRecent: StationTrack[]
}

const stationRepo = new StationApiRepository()

/**
 * NowPlaying — muestra la canción que suena ahora y el historial reciente.
 *
 * Contenido único capturado del metadata ICY (estilo Last.fm): minimalista,
 * una línea + lista pequeña. Datos iniciales server-rendered (SEO) y refresco
 * en cliente vía React Query. El refresco se pausa cuando la pestaña no está
 * visible (refetchIntervalInBackground = false por defecto).
 *
 * Si no hay datos, no renderiza nada para mantener la estética limpia.
 */
export function NowPlaying({ stationId, initialNowPlaying, initialRecent }: NowPlayingProps) {
  const { t } = useAppTranslation()

  const { data: nowPlaying } = useQuery({
    queryKey: ['now-playing', stationId],
    queryFn: () => stationRepo.getNowPlaying(stationId),
    initialData: initialNowPlaying,
    refetchInterval: 25_000,
    staleTime: 20_000,
  })

  const { data: recent } = useQuery({
    queryKey: ['recent-tracks', stationId],
    queryFn: () => stationRepo.getRecentTracks(stationId, 8),
    initialData: initialRecent,
    refetchInterval: 60_000,
    staleTime: 50_000,
  })

  // El "now playing" suele ser también el primer elemento de "recent": lo omitimos del historial.
  const history = (recent ?? []).filter(
    (track) => !nowPlaying || track.playedAt !== nowPlaying.playedAt
  )

  // Sin datos: no renderizar (evita ruido y thin-content visible).
  if (!nowPlaying && history.length === 0) {
    return null
  }

  return (
    <section className="mb-8 animate-fade-up" style={{ animationDelay: '300ms' }}>
      <div className="flex items-center gap-4 mb-4">
        <h2 className="font-broadcast text-[11px] tracking-[0.2em] uppercase text-neutral-500 whitespace-nowrap">
          {t('nowPlaying.title')}
        </h2>
        <div className="flex-1 h-px bg-white/[0.06]" aria-hidden="true" />
      </div>

      <div className="bg-white/[0.03] border border-white/[0.05] rounded-2xl px-5 py-5">
        {/* ── Sonando ahora ─────────────────────────────── */}
        {nowPlaying && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500/60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              <span className="font-broadcast text-[10px] tracking-[0.18em] uppercase text-amber-500/90">
                {t('nowPlaying.live')}
              </span>
            </div>
            <p className="font-display text-lg font-semibold text-white leading-snug">
              {nowPlaying.title}
            </p>
            {nowPlaying.artist && (
              <p className="font-broadcast text-xs text-neutral-400 mt-0.5">
                {nowPlaying.artist}
              </p>
            )}
          </div>
        )}

        {/* ── Sonó antes ────────────────────────────────── */}
        {history.length > 0 && (
          <div>
            <p className="font-broadcast text-[10px] tracking-[0.18em] uppercase text-neutral-600 mb-3">
              {t('nowPlaying.recentlyPlayed')}
            </p>
            <ul className="space-y-2.5">
              {history.map((track, i) => (
                <li key={`${track.playedAt}-${i}`} className="flex items-baseline gap-3">
                  <time
                    dateTime={track.playedAt}
                    suppressHydrationWarning
                    className="font-broadcast text-[10px] text-neutral-600 tabular-nums flex-shrink-0 w-10"
                  >
                    {formatTime(track.playedAt)}
                  </time>
                  <span className="text-xs text-neutral-400 leading-snug">
                    {track.artist ? (
                      <>
                        <span className="text-neutral-300">{track.title}</span>
                        <span className="text-neutral-600"> — </span>
                        {track.artist}
                      </>
                    ) : (
                      <span className="text-neutral-300">{track.title}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

/** Formatea un ISO timestamp a HH:MM en la hora local del usuario. */
function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

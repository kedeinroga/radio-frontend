'use client'

import { useEffect } from 'react'
import { HowlerPlayerAdapter, usePlayerStore } from '@radio-app/app'

let playerInstance: HowlerPlayerAdapter | null = null

const RRADIO_LOGO = '/icon-512.png'

/**
 * Updates the browser/OS Media Session metadata so native controls
 * (lock screen, taskbar, headphone buttons) show the station artwork.
 */
function updateMediaSession(station: any, playing: boolean) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return

  navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'

  const artwork = station.imageUrl
    ? [
        { src: station.imageUrl, sizes: '512x512', type: 'image/jpeg' },
        { src: station.imageUrl, sizes: '256x256', type: 'image/jpeg' },
      ]
    : [{ src: RRADIO_LOGO, sizes: '512x512', type: 'image/png' }]

  navigator.mediaSession.metadata = new MediaMetadata({
    title: station.name,
    artist: station.country || 'Radio Online',
    album: 'Rradio',
    artwork,
  })
}

function clearMediaSession() {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return
  navigator.mediaSession.metadata = null
  navigator.mediaSession.playbackState = 'none'
}

/**
 * Hook to access the audio player
 * Manages singleton player instance
 */
export function usePlayer() {
  const { currentStation, playerState, setPlayerState, play, pause, stop, setVolume } =
    usePlayerStore()

  // Initialize player instance
  if (!playerInstance) {
    playerInstance = new HowlerPlayerAdapter()
  }

  // Subscribe to player state changes
  useEffect(() => {
    if (!playerInstance) return

    const handleStateChange = (state: any) => {
      setPlayerState(state)
    }

    playerInstance.onStateChange(handleStateChange)

    return () => {
      playerInstance?.offStateChange(handleStateChange)
    }
  }, [setPlayerState])

  // Keep Media Session in sync with player state
  useEffect(() => {
    if (currentStation) {
      updateMediaSession(currentStation, playerState.isPlaying)
    } else {
      clearMediaSession()
    }
  }, [currentStation, playerState.isPlaying])

  const playStation = async (station: any) => {
    play(station)
    updateMediaSession(station, true)

    // Registra el play en el backend y obtiene la URL del stream.
    // Para usuarios autenticados el backend devuelve una URL proxiada con token.
    // Para guests devuelve la URL directa. En ambos casos llena station_plays.
    let streamUrl: string = station.streamUrl
    try {
      const res = await fetch('/api/stream/start', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ station_id: station.id, ad_id: null }),
      })
      if (res.ok) {
        const json = await res.json()
        if (json.stream_url) streamUrl = json.stream_url
      }
    } catch {
      // Si falla el tracking, la reproducción continúa con la URL original
    }

    await playerInstance?.play(streamUrl)

    // Wire OS media control buttons
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => playStation(station))
      navigator.mediaSession.setActionHandler('pause', () => pausePlayer())
      navigator.mediaSession.setActionHandler('stop', () => stopPlayer())
    }
  }

  const pausePlayer = async () => {
    pause()
    if (currentStation) updateMediaSession(currentStation, false)
    await playerInstance?.pause()
  }

  const stopPlayer = async () => {
    stop()
    clearMediaSession()
    await playerInstance?.stop()
  }

  return {
    currentStation,
    playerState,

    play: playStation,

    pause: pausePlayer,

    stop: stopPlayer,

    setVolume: async (volume: number) => {
      setVolume(volume)
      await playerInstance?.setVolume(volume)
    },

    togglePlayPause: async () => {
      if (playerState.isPlaying) {
        await pausePlayer()
      } else if (currentStation) {
        await playStation(currentStation)
      }
    },
  }
}

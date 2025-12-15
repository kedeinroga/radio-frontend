'use client'

import { useEffect } from 'react'
import { HowlerPlayerAdapter } from '@radio-app/app/infrastructure/audio/HowlerPlayerAdapter'
import { usePlayerStore } from '@radio-app/app/stores/playerStore'

let playerInstance: HowlerPlayerAdapter | null = null

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

  return {
    currentStation,
    playerState,

    play: async (station: any) => {
      play(station)
      await playerInstance?.play(station.streamUrl)
    },

    pause: async () => {
      pause()
      await playerInstance?.pause()
    },

    stop: async () => {
      stop()
      await playerInstance?.stop()
    },

    setVolume: async (volume: number) => {
      setVolume(volume)
      await playerInstance?.setVolume(volume)
    },

    togglePlayPause: async () => {
      if (playerState.isPlaying) {
        pause()
        await playerInstance?.pause()
      } else if (currentStation) {
        play(currentStation)
        await playerInstance?.play(currentStation.streamUrl)
      }
    },
  }
}

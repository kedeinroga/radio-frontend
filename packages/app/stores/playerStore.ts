import { create } from 'zustand'
import { Station } from '../domain/entities/Station'
import { PlayerState } from '../domain/repositories/IPlayerRepository'

interface PlayerStore {
  // Current station
  currentStation: Station | null
  setCurrentStation: (station: Station | null) => void

  // Player state
  playerState: PlayerState
  setPlayerState: (state: PlayerState) => void

  // Actions
  play: (station: Station) => void
  pause: () => void
  stop: () => void
  setVolume: (volume: number) => void
}

/**
 * Global Player Store
 * Manages current playing station and player state
 */
export const usePlayerStore = create<PlayerStore>((set) => ({
  currentStation: null,
  playerState: {
    isPlaying: false,
    isBuffering: false,
    volume: 0.7,
  },

  setCurrentStation: (station) => set({ currentStation: station }),

  setPlayerState: (state) => set({ playerState: state }),

  play: (station) =>
    set({
      currentStation: station,
      playerState: { isPlaying: true, isBuffering: true, volume: 0.7 },
    }),

  pause: () =>
    set((state) => ({
      playerState: { ...state.playerState, isPlaying: false },
    })),

  stop: () =>
    set({
      currentStation: null,
      playerState: { isPlaying: false, isBuffering: false, volume: 0.7 },
    }),

  setVolume: (volume) =>
    set((state) => ({
      playerState: { ...state.playerState, volume },
    })),
}))

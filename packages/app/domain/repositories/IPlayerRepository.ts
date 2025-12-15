/**
 * Player State
 */
export interface PlayerState {
  isPlaying: boolean
  isBuffering: boolean
  currentTime?: number
  duration?: number
  volume?: number
  error?: string
}

/**
 * Player Repository Interface
 * Defines operations for audio playback
 */
export interface IPlayerRepository {
  /**
   * Play a stream URL
   */
  play(streamUrl: string): Promise<void>

  /**
   * Pause playback
   */
  pause(): Promise<void>

  /**
   * Stop playback
   */
  stop(): Promise<void>

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): Promise<void>

  /**
   * Get current playback time
   */
  getCurrentTime(): Promise<number>

  /**
   * Subscribe to player state changes
   */
  onStateChange(callback: (state: PlayerState) => void): void

  /**
   * Unsubscribe from player state changes
   */
  offStateChange(callback: (state: PlayerState) => void): void
}

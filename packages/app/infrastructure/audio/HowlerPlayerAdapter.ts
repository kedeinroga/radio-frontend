import { Howl } from 'howler'
import { IPlayerRepository, PlayerState } from '../../domain/repositories/IPlayerRepository'

/**
 * Web Audio Player Adapter
 * Implements IPlayerRepository using Howler.js
 */
export class HowlerPlayerAdapter implements IPlayerRepository {
  private howl: Howl | null = null
  private currentStreamUrl: string | null = null
  private listeners: Set<(state: PlayerState) => void> = new Set()
  private state: PlayerState = {
    isPlaying: false,
    isBuffering: false,
    volume: 0.7,
  }

  async play(streamUrl: string): Promise<void> {
    // If already playing this stream, just resume
    if (this.currentStreamUrl === streamUrl && this.howl) {
      this.howl.play()
      this.updateState({ isPlaying: true, isBuffering: false })
      return
    }

    // Stop current stream if any
    if (this.howl) {
      this.howl.unload()
    }

    this.currentStreamUrl = streamUrl
    this.updateState({ isBuffering: true, isPlaying: false })

    // Create new Howl instance
    this.howl = new Howl({
      src: [streamUrl],
      html5: true, // Force HTML5 for streaming
      format: ['mp3', 'aac', 'mpeg'],
      volume: this.state.volume || 0.7,
      onload: () => {
        this.updateState({ isBuffering: false, isPlaying: true })
      },
      onplay: () => {
        this.updateState({ isPlaying: true, isBuffering: false })
      },
      onpause: () => {
        this.updateState({ isPlaying: false })
      },
      onstop: () => {
        this.updateState({ isPlaying: false })
      },
      onloaderror: (_id, error) => {
        this.updateState({
          isPlaying: false,
          isBuffering: false,
          error: `Failed to load stream: ${error}`,
        })
      },
      onplayerror: (_id, error) => {
        this.updateState({
          isPlaying: false,
          isBuffering: false,
          error: `Playback error: ${error}`,
        })
      },
    })

    this.howl.play()
  }

  async pause(): Promise<void> {
    if (this.howl) {
      this.howl.pause()
      this.updateState({ isPlaying: false })
    }
  }

  async stop(): Promise<void> {
    if (this.howl) {
      this.howl.stop()
      this.howl.unload()
      this.howl = null
      this.currentStreamUrl = null
      this.updateState({ isPlaying: false, isBuffering: false })
    }
  }

  async setVolume(volume: number): Promise<void> {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    if (this.howl) {
      this.howl.volume(clampedVolume)
    }
    this.updateState({ volume: clampedVolume })
  }

  async getCurrentTime(): Promise<number> {
    if (this.howl) {
      return this.howl.seek() as number
    }
    return 0
  }

  onStateChange(callback: (state: PlayerState) => void): void {
    this.listeners.add(callback)
  }

  offStateChange(callback: (state: PlayerState) => void): void {
    this.listeners.delete(callback)
  }

  private updateState(updates: Partial<PlayerState>): void {
    this.state = { ...this.state, ...updates }
    this.listeners.forEach((listener) => listener(this.state))
  }

  /**
   * Get current player state
   */
  getState(): PlayerState {
    return { ...this.state }
  }
}

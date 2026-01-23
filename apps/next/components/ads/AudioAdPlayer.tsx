'use client'

/**
 * Audio Ad Player Component
 * 
 * Reproduce anuncios de audio con tracking completo,
 * soporte para skip, controles de volumen, y companion banners.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import type { AudioAd, AudioAdPlaybackState } from '@radio-app/app'

export interface AudioAdPlayerProps {
  ad: AudioAd
  autoPlay?: boolean
  volume?: number
  respectUserVolume?: boolean
  onStart?: (ad: AudioAd) => void
  onProgress?: (ad: AudioAd, currentTime: number, quartile: string) => void
  onComplete?: (ad: AudioAd) => void
  onSkip?: (ad: AudioAd, currentTime: number) => void
  onError?: (ad: AudioAd, error: string) => void
  onMute?: (ad: AudioAd) => void
  onUnmute?: (ad: AudioAd) => void
  onPause?: (ad: AudioAd) => void
  onResume?: (ad: AudioAd) => void
  onClickThrough?: (ad: AudioAd) => void
  className?: string
}

/**
 * Audio Ad Player Component
 */
export function AudioAdPlayer({
  ad,
  autoPlay = true,
  volume = 0.8,
  respectUserVolume = true,
  onStart,
  onProgress,
  onComplete,
  onSkip,
  onError,
  onMute,
  onUnmute,
  onPause,
  onResume,
  onClickThrough,
  className = '',
}: AudioAdPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [state, setState] = useState<AudioAdPlaybackState>({
    adId: ad.id,
    placement: ad.placement,
    status: 'loading',
    currentTime: 0,
    duration: ad.duration,
    volume,
    isMuted: false,
    canSkip: false,
    skipIn: ad.skipAfter,
  })
  
  // Track which quartiles have been fired
  const quartilesFired = useRef<Set<string>>(new Set())
  
  /**
   * Fire tracking pixel
   */
  const fireTracking = useCallback(async (url: string) => {
    if (!url) return
    
    try {
      await fetch(url, { method: 'GET', mode: 'no-cors' })
    } catch (error) {

    }
  }, [])
  
  /**
   * Handle play start
   */
  const handleStart = useCallback(() => {
    setState(prev => ({ ...prev, status: 'playing' }))
    
    // Fire tracking
    fireTracking(ad.impressionUrl)
    fireTracking(ad.startUrl || '')
    
    onStart?.(ad)
  }, [ad, fireTracking, onStart])
  
  /**
   * Handle time update
   */
  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return
    
    const currentTime = audioRef.current.currentTime
    const duration = audioRef.current.duration || ad.duration
    const percentage = (currentTime / duration) * 100
    
    setState(prev => ({
      ...prev,
      currentTime,
      duration,
    }))
    
    // Check if skip is available
    if (ad.skipAfter && currentTime >= ad.skipAfter) {
      setState(prev => ({ ...prev, canSkip: true, skipIn: undefined }))
    } else if (ad.skipAfter && currentTime < ad.skipAfter) {
      setState(prev => ({ ...prev, skipIn: ad.skipAfter! - currentTime }))
    }
    
    // Fire quartile tracking
    let quartile = ''
    let trackingUrl = ''
    
    if (percentage >= 25 && percentage < 50 && !quartilesFired.current.has('first')) {
      quartile = 'firstQuartile'
      trackingUrl = ad.firstQuartileUrl || ''
      quartilesFired.current.add('first')
    } else if (percentage >= 50 && percentage < 75 && !quartilesFired.current.has('mid')) {
      quartile = 'midpoint'
      trackingUrl = ad.midpointUrl || ''
      quartilesFired.current.add('mid')
    } else if (percentage >= 75 && percentage < 100 && !quartilesFired.current.has('third')) {
      quartile = 'thirdQuartile'
      trackingUrl = ad.thirdQuartileUrl || ''
      quartilesFired.current.add('third')
    }
    
    if (quartile) {
      fireTracking(trackingUrl)
      onProgress?.(ad, currentTime, quartile)
    }
  }, [ad, fireTracking, onProgress])
  
  /**
   * Handle complete
   */
  const handleComplete = useCallback(() => {
    setState(prev => ({ ...prev, status: 'completed' }))
    
    // Fire tracking
    fireTracking(ad.completeUrl || '')
    
    onComplete?.(ad)
  }, [ad, fireTracking, onComplete])
  
  /**
   * Handle error
   */
  const handleError = useCallback(() => {
    const errorMsg = 'Failed to load audio ad'
    setState(prev => ({ ...prev, status: 'error', error: errorMsg }))
    
    // Fire tracking
    fireTracking(ad.errorUrl || '')
    
    onError?.(ad, errorMsg)
  }, [ad, fireTracking, onError])
  
  /**
   * Handle skip
   */
  const handleSkip = useCallback(() => {
    if (!audioRef.current || !state.canSkip) return
    
    const currentTime = audioRef.current.currentTime
    
    setState(prev => ({ ...prev, status: 'skipped' }))
    
    // Fire tracking
    fireTracking(ad.skipUrl || '')
    
    onSkip?.(ad, currentTime)
  }, [ad, state.canSkip, fireTracking, onSkip])
  
  /**
   * Handle mute toggle
   */
  const handleMuteToggle = useCallback(() => {
    if (!audioRef.current) return
    
    const newMuted = !audioRef.current.muted
    audioRef.current.muted = newMuted
    
    setState(prev => ({ ...prev, isMuted: newMuted }))
    
    // Fire tracking
    if (newMuted) {
      fireTracking(ad.muteUrl || '')
      onMute?.(ad)
    } else {
      fireTracking(ad.unmuteUrl || '')
      onUnmute?.(ad)
    }
  }, [ad, fireTracking, onMute, onUnmute])
  
  /**
   * Handle pause/resume
   */
  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return
    
    if (audioRef.current.paused) {
      audioRef.current.play()
      setState(prev => ({ ...prev, status: 'playing' }))
      fireTracking(ad.resumeUrl || '')
      onResume?.(ad)
    } else {
      audioRef.current.pause()
      setState(prev => ({ ...prev, status: 'paused' }))
      fireTracking(ad.pauseUrl || '')
      onPause?.(ad)
    }
  }, [ad, fireTracking, onPause, onResume])
  
  /**
   * Handle volume change
   */
  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!audioRef.current) return
    
    audioRef.current.volume = newVolume
    setState(prev => ({ ...prev, volume: newVolume }))
  }, [])
  
  /**
   * Handle click through
   */
  const handleClickThrough = useCallback(() => {
    if (!ad.clickUrl) return
    
    // Fire tracking
    fireTracking(ad.clickUrl)
    
    // Open in new tab
    window.open(ad.clickUrl, '_blank', 'noopener,noreferrer')
    
    onClickThrough?.(ad)
  }, [ad, fireTracking, onClickThrough])
  
  /**
   * Initialize audio
   */
  useEffect(() => {
    if (!audioRef.current) return
    
    const audio = audioRef.current
    
    // Set volume
    if (respectUserVolume) {
      audio.volume = volume
    } else {
      audio.volume = 1
    }
    
    // Auto play
    if (autoPlay) {
      audio.play().catch(error => {

        setState(prev => ({ ...prev, status: 'error', error: 'Autoplay failed' }))
      })
    }
    
    setState(prev => ({ ...prev, status: 'ready' }))
  }, [autoPlay, volume, respectUserVolume])
  
  /**
   * Format time display
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div className={`audio-ad-player bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg ${className}`}>
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={ad.audioUrl}
        onPlay={handleStart}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleComplete}
        onError={handleError}
        preload="auto"
      />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
            AD
          </div>
          <span className="text-sm text-gray-600">
            {ad.placement.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        
        {state.canSkip ? (
          <button
            onClick={handleSkip}
            className="bg-white text-purple-600 text-sm font-semibold px-4 py-1.5 rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors"
          >
            Skip Ad
          </button>
        ) : state.skipIn !== undefined ? (
          <span className="text-sm text-gray-500">
            Skip in {Math.ceil(state.skipIn)}s
          </span>
        ) : null}
      </div>
      
      {/* Ad Info */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {ad.title}
        </h3>
        {ad.advertiser && (
          <p className="text-sm text-gray-600">
            by {ad.advertiser}
          </p>
        )}
        {ad.description && (
          <p className="text-sm text-gray-600 mt-2">
            {ad.description}
          </p>
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-purple-600 h-full transition-all duration-300"
            style={{ width: `${(state.currentTime / state.duration) * 100}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
          <span>{formatTime(state.currentTime)}</span>
          <span>{formatTime(state.duration)}</span>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition-colors"
            disabled={state.status === 'loading' || state.status === 'error'}
          >
            {state.status === 'playing' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          {/* Mute/Unmute */}
          <button
            onClick={handleMuteToggle}
            className="text-gray-600 hover:text-purple-600 transition-colors"
          >
            {state.isMuted ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          {/* Volume Slider */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={state.volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-20 accent-purple-600"
            disabled={state.isMuted}
          />
        </div>
        
        {/* Learn More Button */}
        {ad.clickUrl && (
          <button
            onClick={handleClickThrough}
            className="bg-white text-purple-600 text-sm font-semibold px-4 py-2 rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors"
          >
            Learn More →
          </button>
        )}
      </div>
      
      {/* Companion Banner */}
      {ad.companionBannerUrl && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <a
            href={ad.companionClickUrl || ad.clickUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => ad.companionClickUrl && fireTracking(ad.companionClickUrl)}
          >
            <img
              src={ad.companionBannerUrl}
              alt={ad.title}
              className="w-full rounded-lg hover:opacity-90 transition-opacity"
              width={ad.companionWidth}
              height={ad.companionHeight}
            />
          </a>
        </div>
      )}
      
      {/* Status Messages */}
      {state.status === 'error' && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          Error loading ad: {state.error}
        </div>
      )}
      
      {state.status === 'completed' && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
          Ad completed. Returning to content...
        </div>
      )}
      
      {state.status === 'skipped' && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          Ad skipped. Returning to content...
        </div>
      )}
    </div>
  )
}

/**
 * Minimal Audio Ad Player (no UI controls)
 */
export function MinimalAudioAdPlayer({
  ad,
  autoPlay = true,
  volume = 0.8,
  onComplete,
  onSkip,
}: {
  ad: AudioAd
  autoPlay?: boolean
  volume?: number
  onComplete?: (ad: AudioAd) => void
  onSkip?: (ad: AudioAd) => void
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [canSkip, setCanSkip] = useState(false)
  
  useEffect(() => {
    if (!audioRef.current) return
    
    const audio = audioRef.current
    audio.volume = volume
    
    if (autoPlay) {
      audio.play()
    }
  }, [autoPlay, volume])
  
  useEffect(() => {
    if (!ad.skipAfter) return
    
    const timer = setTimeout(() => {
      setCanSkip(true)
    }, ad.skipAfter * 1000)
    
    return () => clearTimeout(timer)
  }, [ad.skipAfter])
  
  return (
    <div className="fixed bottom-4 right-4 bg-purple-600 text-white rounded-lg shadow-lg p-4 max-w-sm">
      <audio
        ref={audioRef}
        src={ad.audioUrl}
        onEnded={() => onComplete?.(ad)}
        preload="auto"
      />
      
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-bold mb-1">AD</div>
          <div className="text-sm font-semibold">{ad.title}</div>
        </div>
        
        {canSkip && (
          <button
            onClick={() => onSkip?.(ad)}
            className="bg-white text-purple-600 text-xs font-bold px-3 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  )
}

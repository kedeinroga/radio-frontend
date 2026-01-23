'use client'

/**
 * Radio Player with Audio Ads Example
 * 
 * Ejemplo de integración del sistema de anuncios de audio
 * con el reproductor de radio.
 */

import { useState, useEffect, useCallback } from 'react'
import { AudioAdPlayer } from './AudioAdPlayer'
import { useAudioAdPlayer } from '../../hooks/useAudioAdPlayer'

export default function RadioPlayerWithAdsExample() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStation, setCurrentStation] = useState('Rock Radio')
  const [playTime, setPlayTime] = useState(0)
  
  const audioAdPlayer = useAudioAdPlayer({
    enabled: true,
    placements: ['pre_roll', 'mid_roll', 'post_roll', 'station_break'],
    maxPreRoll: 1,
    maxMidRoll: 2,
    maxPostRoll: 1,
    minMidRollInterval: 300, // 5 minutes
    onAdStart: (ad) => {

      // Pause radio stream
      setIsPlaying(false)
    },
    onAdComplete: (ad) => {

      // Resume radio stream
      setIsPlaying(true)
    },
    onAdSkip: (ad) => {

      // Resume radio stream
      setIsPlaying(true)
    },
    onAdError: (ad, error) => {

      // Resume radio stream
      setIsPlaying(true)
    },
  })
  
  /**
   * Handle play button
   */
  const handlePlay = useCallback(() => {
    // If there are pre-roll ads, play them first
    if (!audioAdPlayer.isPlayingAd && audioAdPlayer.enabled) {
      const hasPreRoll = audioAdPlayer.playNextPreRoll()
      if (hasPreRoll) {
        // Pre-roll ad will play, radio will start after
        return
      }
    }
    
    // No pre-roll ads, start radio immediately
    setIsPlaying(true)
  }, [audioAdPlayer])
  
  /**
   * Handle pause button
   */
  const handlePause = useCallback(() => {
    setIsPlaying(false)
  }, [])
  
  /**
   * Handle station change
   */
  const handleStationChange = useCallback((newStation: string) => {
    // Pause current playback
    setIsPlaying(false)
    
    // Play station break ad if available
    if (audioAdPlayer.enabled) {
      const hasStationBreak = audioAdPlayer.playStationBreak()
      if (hasStationBreak) {
        // Ad will play, then resume with new station
        setCurrentStation(newStation)
        return
      }
    }
    
    // No station break ad, change immediately
    setCurrentStation(newStation)
    setIsPlaying(true)
  }, [audioAdPlayer])
  
  /**
   * Track play time for mid-roll ads
   */
  useEffect(() => {
    if (!isPlaying || audioAdPlayer.isPlayingAd) return
    
    const interval = setInterval(() => {
      setPlayTime(prev => {
        const newTime = prev + 1
        
        // Check if mid-roll ad should play
        audioAdPlayer.checkMidRoll(newTime)
        
        return newTime
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isPlaying, audioAdPlayer])
  
  /**
   * Format time display
   */
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Radio Player with Audio Ads
          </h1>
          <p className="text-gray-600">
            Example integration of audio ads with radio streaming
          </p>
        </div>
        
        {/* Ad Stats */}
        {audioAdPlayer.enabled && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {audioAdPlayer.adsPlayed}
                </div>
                <div className="text-sm text-gray-600">Ads Played</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {audioAdPlayer.remainingAds}
                </div>
                <div className="text-sm text-gray-600">Ads Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {audioAdPlayer.totalAdsInSession}
                </div>
                <div className="text-sm text-gray-600">Total in Session</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Audio Ad Player */}
        {audioAdPlayer.isPlayingAd && audioAdPlayer.currentAd && (
          <div className="mb-6">
            <AudioAdPlayer
              ad={audioAdPlayer.currentAd}
              autoPlay={true}
              volume={0.8}
              onComplete={audioAdPlayer.completeAd}
              onSkip={audioAdPlayer.skipAd}
              onError={(_ad, error) => audioAdPlayer.handleAdError(error)}
            />
          </div>
        )}
        
        {/* Radio Player */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-8">
          {/* Station Info */}
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">📻</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentStation}
            </h2>
            <p className="text-gray-600">
              {isPlaying ? '🔴 Live' : '⏸ Paused'} • Listening time: {formatTime(playTime)}
            </p>
          </div>
          
          {/* Audio Visualization */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-1 h-20">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-1 bg-gradient-to-t from-purple-600 to-pink-600 rounded-full transition-all ${
                    isPlaying ? 'animate-pulse' : ''
                  }`}
                  style={{
                    height: isPlaying ? `${Math.random() * 100}%` : '20%',
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={() => handleStationChange('Rock Radio')}
              className="text-gray-600 hover:text-purple-600 transition-colors"
              title="Previous Station"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            </button>
            
            {isPlaying ? (
              <button
                onClick={handlePause}
                className="bg-purple-600 text-white p-4 rounded-full hover:bg-purple-700 transition-colors shadow-lg"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handlePlay}
                className="bg-purple-600 text-white p-4 rounded-full hover:bg-purple-700 transition-colors shadow-lg"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            
            <button
              onClick={() => handleStationChange('Jazz Radio')}
              className="text-gray-600 hover:text-purple-600 transition-colors"
              title="Next Station"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
              </svg>
            </button>
          </div>
          
          {/* Station List */}
          <div className="grid grid-cols-3 gap-4">
            {['Rock Radio', 'Jazz Radio', 'Pop Radio', 'Classical Radio', 'Hip Hop Radio', 'Electronic Radio'].map((station) => (
              <button
                key={station}
                onClick={() => handleStationChange(station)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  currentStation === station
                    ? 'border-purple-600 bg-purple-50 text-purple-900'
                    : 'border-gray-200 hover:border-purple-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="font-semibold">{station}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              📺 Ad Placements
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li><strong>Pre-roll:</strong> Plays before stream starts</li>
              <li><strong>Mid-roll:</strong> Plays during streaming (every 5 min)</li>
              <li><strong>Post-roll:</strong> Plays when stopping (future)</li>
              <li><strong>Station Break:</strong> Plays when changing stations</li>
            </ul>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-green-900 mb-2">
              💎 Premium Benefits
            </h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>✓ No audio ads interrupting your music</li>
              <li>✓ Uninterrupted listening experience</li>
              <li>✓ High quality audio streaming</li>
              <li>✓ Unlimited station changes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

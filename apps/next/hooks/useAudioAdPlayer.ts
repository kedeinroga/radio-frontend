'use client'

/**
 * useAudioAdPlayer Hook
 * 
 * Hook para gestionar la cola de anuncios de audio y su reproducción
 * durante la experiencia de radio streaming.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import type { AudioAd, AudioAdQueue, AudioAdPlacement } from '@radio-app/app'
import { useIsPremium } from './usePremiumStatus'

export interface UseAudioAdPlayerOptions {
  enabled?: boolean
  placements?: AudioAdPlacement[]
  maxPreRoll?: number
  maxMidRoll?: number
  maxPostRoll?: number
  minMidRollInterval?: number // seconds
  onAdStart?: (ad: AudioAd) => void
  onAdComplete?: (ad: AudioAd) => void
  onAdSkip?: (ad: AudioAd) => void
  onAdError?: (ad: AudioAd, error: string) => void
}

export interface AudioAdPlayerState {
  currentAd: AudioAd | null
  queue: AudioAdQueue
  isPlayingAd: boolean
  adPlacement: AudioAdPlacement | null
  adsPlayed: number
  totalAdsInSession: number
}

/**
 * useAudioAdPlayer Hook
 */
export function useAudioAdPlayer(options: UseAudioAdPlayerOptions = {}) {
  const {
    enabled = true,
    placements = ['pre_roll', 'mid_roll', 'post_roll', 'station_break'],
    maxPreRoll = 1,
    maxMidRoll = 2,
    maxPostRoll = 1,
    minMidRollInterval = 300, // 5 minutes
    onAdStart,
    onAdComplete,
    onAdSkip,
    onAdError,
  } = options
  
  const isPremium = useIsPremium()
  const [state, setState] = useState<AudioAdPlayerState>({
    currentAd: null,
    queue: {
      preRoll: [],
      midRoll: [],
      postRoll: [],
      stationBreak: [],
    },
    isPlayingAd: false,
    adPlacement: null,
    adsPlayed: 0,
    totalAdsInSession: 0,
  })
  
  const lastMidRollTime = useRef<number>(0)
  
  /**
   * Fetch ads from API
   */
  const fetchAds = useCallback(async (placement: AudioAdPlacement): Promise<AudioAd[]> => {
    try {
      const response = await fetch('/api/ads/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placement,
          userContext: {
            // Add user context for targeting
            country: navigator.language.split('-')[1] || 'US',
            timestamp: new Date().toISOString(),
          },
        }),
      })
      
      if (!response.ok) {
        return []
      }
      
      const data = await response.json()
      return data.ads || []
    } catch (error) {
      return []
    }
  }, [])
  
  /**
   * Load ad queue
   */
  const loadAdQueue = useCallback(async () => {
    if (!enabled || isPremium) return
    
    const queue: AudioAdQueue = {
      preRoll: [],
      midRoll: [],
      postRoll: [],
      stationBreak: [],
    }
    
    // Fetch ads for each placement
    for (const placement of placements) {
      const ads = await fetchAds(placement)
      
      switch (placement) {
        case 'pre_roll':
          queue.preRoll = ads.slice(0, maxPreRoll)
          break
        case 'mid_roll':
          // Create mid-roll schedule
          queue.midRoll = ads.slice(0, maxMidRoll).map((ad, index) => ({
            ad,
            playAt: minMidRollInterval * (index + 1),
          }))
          break
        case 'post_roll':
          queue.postRoll = ads.slice(0, maxPostRoll)
          break
        case 'station_break':
          queue.stationBreak = ads
          break
      }
    }
    
    setState(prev => ({
      ...prev,
      queue,
      totalAdsInSession: queue.preRoll.length + queue.midRoll.length + queue.postRoll.length + queue.stationBreak.length,
    }))
  }, [enabled, isPremium, placements, maxPreRoll, maxMidRoll, maxPostRoll, minMidRollInterval, fetchAds])
  
  /**
   * Play ad
   */
  const playAd = useCallback((ad: AudioAd, placement: AudioAdPlacement) => {
    if (!enabled || isPremium) return
    
    setState(prev => ({
      ...prev,
      currentAd: ad,
      isPlayingAd: true,
      adPlacement: placement,
    }))
    
    onAdStart?.(ad)
  }, [enabled, isPremium, onAdStart])
  
  /**
   * Complete ad
   */
  const completeAd = useCallback(() => {
    const { currentAd } = state
    if (!currentAd) return
    
    setState(prev => ({
      ...prev,
      currentAd: null,
      isPlayingAd: false,
      adPlacement: null,
      adsPlayed: prev.adsPlayed + 1,
    }))
    
    onAdComplete?.(currentAd)
  }, [state, onAdComplete])
  
  /**
   * Skip ad
   */
  const skipAd = useCallback(() => {
    const { currentAd } = state
    if (!currentAd) return
    
    setState(prev => ({
      ...prev,
      currentAd: null,
      isPlayingAd: false,
      adPlacement: null,
      adsPlayed: prev.adsPlayed + 1,
    }))
    
    onAdSkip?.(currentAd)
  }, [state, onAdSkip])
  
  /**
   * Handle ad error
   */
  const handleAdError = useCallback((error: string) => {
    const { currentAd } = state
    if (!currentAd) return
    
    setState(prev => ({
      ...prev,
      currentAd: null,
      isPlayingAd: false,
      adPlacement: null,
    }))
    
    onAdError?.(currentAd, error)
  }, [state, onAdError])
  
  /**
   * Play next pre-roll ad
   */
  const playNextPreRoll = useCallback(() => {
    const ad = state.queue.preRoll.shift()
    if (!ad) return false
    
    playAd(ad, 'pre_roll')
    return true
  }, [state.queue, playAd])
  
  /**
   * Play next post-roll ad
   */
  const playNextPostRoll = useCallback(() => {
    const ad = state.queue.postRoll.shift()
    if (!ad) return false
    
    playAd(ad, 'post_roll')
    return true
  }, [state.queue, playAd])
  
  /**
   * Play station break ad
   */
  const playStationBreak = useCallback(() => {
    const ad = state.queue.stationBreak.shift()
    if (!ad) return false
    
    playAd(ad, 'station_break')
    return true
  }, [state.queue, playAd])
  
  /**
   * Check if mid-roll ad should play
   */
  const checkMidRoll = useCallback((currentTime: number) => {
    if (!enabled || isPremium || state.isPlayingAd) return false
    
    // Check if enough time has passed since last mid-roll
    const timeSinceLastMidRoll = (Date.now() - lastMidRollTime.current) / 1000
    if (timeSinceLastMidRoll < minMidRollInterval) return false
    
    // Check if there's a mid-roll scheduled
    const nextMidRoll = state.queue.midRoll[0]
    if (!nextMidRoll) return false
    
    // Check if it's time to play
    if (currentTime >= nextMidRoll.playAt) {
      state.queue.midRoll.shift()
      playAd(nextMidRoll.ad, 'mid_roll')
      lastMidRollTime.current = Date.now()
      return true
    }
    
    return false
  }, [enabled, isPremium, state, minMidRollInterval, playAd])
  
  /**
   * Get remaining ads count
   */
  const getRemainingAdsCount = useCallback(() => {
    return (
      state.queue.preRoll.length +
      state.queue.midRoll.length +
      state.queue.postRoll.length +
      state.queue.stationBreak.length
    )
  }, [state.queue])
  
  /**
   * Clear queue
   */
  const clearQueue = useCallback(() => {
    setState(prev => ({
      ...prev,
      queue: {
        preRoll: [],
        midRoll: [],
        postRoll: [],
        stationBreak: [],
      },
      currentAd: null,
      isPlayingAd: false,
      adPlacement: null,
    }))
  }, [])
  
  /**
   * Initialize: Load ad queue
   */
  useEffect(() => {
    if (!enabled || isPremium) return
    
    loadAdQueue()
  }, [enabled, isPremium, loadAdQueue])
  
  /**
   * Cleanup: Clear queue on unmount
   */
  useEffect(() => {
    return () => {
      clearQueue()
    }
  }, [clearQueue])
  
  return {
    // State
    currentAd: state.currentAd,
    isPlayingAd: state.isPlayingAd,
    adPlacement: state.adPlacement,
    adsPlayed: state.adsPlayed,
    totalAdsInSession: state.totalAdsInSession,
    remainingAds: getRemainingAdsCount(),
    
    // Actions
    playNextPreRoll,
    playNextPostRoll,
    playStationBreak,
    checkMidRoll,
    completeAd,
    skipAd,
    handleAdError,
    loadAdQueue,
    clearQueue,
    
    // Utils
    enabled: enabled && !isPremium,
  }
}

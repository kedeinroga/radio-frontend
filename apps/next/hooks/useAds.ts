/**
 * useAds Hook
 * 
 * React hook for fetching and tracking advertisements.
 * Integrates frequency capping, CSRF protection, and analytics.
 */

'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type {
  Advertisement,
  AdPlacement,
  AdContext,
  ImpressionMetadata,
} from '@radio-app/app'
import {
  FetchAdForPlacement,
  TrackAdImpression,
  TrackAdClick,
  AdvertisementApiRepository,
} from '@radio-app/app'

// Initialize repository (uses API URL from env)
const adRepository = new AdvertisementApiRepository(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
)

// Initialize use cases
const fetchAdUseCase = new FetchAdForPlacement(adRepository)
const trackImpressionUseCase = new TrackAdImpression(adRepository)
const trackClickUseCase = new TrackAdClick(adRepository)

/**
 * Session storage for frequency capping
 */
interface SessionAdData {
  lastAdTimestamp?: Date
  sessionImpressions: number
  impressionIds: Record<string, string> // adId -> impressionId
}

/**
 * Hook for fetching an ad for a specific placement
 */
export function useAdForPlacement(placement: AdPlacement, context: AdContext) {
  const [ad, setAd] = useState<Advertisement | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [frequencyCapped, setFrequencyCapped] = useState(false)
  const [nextAvailableTime, setNextAvailableTime] = useState<Date | undefined>()

  // Track session data in ref to avoid re-renders
  const sessionDataRef = useRef<Record<AdPlacement, SessionAdData>>({
    home_banner: { sessionImpressions: 0, impressionIds: {} },
    search_banner: { sessionImpressions: 0, impressionIds: {} },
    station_list_banner: { sessionImpressions: 0, impressionIds: {} },
    player_banner: { sessionImpressions: 0, impressionIds: {} },
    search_native: { sessionImpressions: 0, impressionIds: {} },
    station_list_native: { sessionImpressions: 0, impressionIds: {} },
    audio_pre_roll: { sessionImpressions: 0, impressionIds: {} },
    audio_mid_roll: { sessionImpressions: 0, impressionIds: {} },
    interstitial_startup: { sessionImpressions: 0, impressionIds: {} },
    interstitial_between_stations: { sessionImpressions: 0, impressionIds: {} },
  })

  // Generate session ID (persists across component re-renders)
  const sessionIdRef = useRef<string>(
    typeof window !== 'undefined'
      ? sessionStorage.getItem('adSessionId') || crypto.randomUUID()
      : crypto.randomUUID()
  )

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('adSessionId', sessionIdRef.current)
    }
  }, [])

  const fetchAd = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const sessionData = sessionDataRef.current[placement]

      const result = await fetchAdUseCase.execute({
        placement,
        context,
        sessionId: sessionIdRef.current,
        lastAdTimestamp: sessionData.lastAdTimestamp,
        sessionImpressions: sessionData.sessionImpressions,
      })

      if (result.ad.ad) {
        setAd(result.ad.ad)
        setFrequencyCapped(false)
        
        // Update session data
        sessionData.lastAdTimestamp = new Date()
        sessionData.sessionImpressions += 1
      } else {
        setAd(null)
        setFrequencyCapped(result.frequencyCapped)
        setNextAvailableTime(result.nextAvailableTime)
        
        // Set error message based on reason
        if (result.ad.reason === 'premium_user') {
          setError('No ads for premium users')
        } else if (result.ad.reason === 'frequency_cap_reached') {
          setError('Frequency cap reached')
        } else if (result.ad.reason === 'geo_restricted') {
          setError('No ads available in your region')
        } else {
          setError('No ads available')
        }
      }
    } catch (err) {
      console.error('[useAdForPlacement] Error fetching ad:', err)
      setError('Failed to fetch ad')
      setAd(null)
    } finally {
      setIsLoading(false)
    }
  }, [placement, context])

  return {
    ad,
    isLoading,
    error,
    frequencyCapped,
    nextAvailableTime,
    fetchAd,
  }
}

/**
 * Hook for tracking ad impressions
 */
export function useTrackImpression() {
  const [isTracking, setIsTracking] = useState(false)

  const trackImpression = useCallback(
    async (
      adId: string,
      placement: AdPlacement,
      metadata: Partial<ImpressionMetadata>
    ): Promise<string | null> => {
      setIsTracking(true)

      try {
        // Generate session ID if not provided
        const sessionId =
          typeof window !== 'undefined'
            ? sessionStorage.getItem('adSessionId') || crypto.randomUUID()
            : crypto.randomUUID()

        const fullMetadata: ImpressionMetadata = {
          placement,
          sessionId,
          timestamp: new Date(),
          ...metadata,
        }

        const result = await trackImpressionUseCase.execute({
          adId,
          metadata: fullMetadata,
        })

        if (result.success) {
          return result.impressionId
        }

        return null
      } catch (error) {
        console.error('[useTrackImpression] Error:', error)
        return null
      } finally {
        setIsTracking(false)
      }
    },
    []
  )

  return { trackImpression, isTracking }
}

/**
 * Hook for tracking ad clicks
 */
export function useTrackClick() {
  const [isTracking, setIsTracking] = useState(false)

  const trackClick = useCallback(
    async (
      adId: string,
      impressionId: string,
      metadata?: {
        userId?: string
        deviceType?: 'mobile' | 'tablet' | 'desktop'
        referrer?: string
      }
    ): Promise<boolean> => {
      setIsTracking(true)

      try {
        const result = await trackClickUseCase.execute({
          adId,
          metadata: {
            impressionId,
            timestamp: new Date(),
            ...metadata,
          },
        })

        return result.success
      } catch (error) {
        console.error('[useTrackClick] Error:', error)
        return false
      } finally {
        setIsTracking(false)
      }
    },
    []
  )

  return { trackClick, isTracking }
}

/**
 * Combined hook for full ad lifecycle
 */
export function useAd(placement: AdPlacement, context: AdContext) {
  const adData = useAdForPlacement(placement, context)
  const { trackImpression, isTracking: isTrackingImpression } = useTrackImpression()
  const { trackClick, isTracking: isTrackingClick } = useTrackClick()

  const [impressionId, setImpressionId] = useState<string | null>(null)

  // Auto-track impression when ad is fetched
  useEffect(() => {
    if (adData.ad && !impressionId) {
      trackImpression(adData.ad.id, placement, {
        userId: context.userId,
        country: context.country,
        deviceType: context.deviceType,
      }).then((id) => {
        if (id) {
          setImpressionId(id)
        }
      })
    }
  }, [adData.ad, impressionId, placement, context, trackImpression])

  const handleAdClick = useCallback(async () => {
    if (!adData.ad || !impressionId) {
      console.warn('[useAd] Cannot track click: no ad or impression ID')
      return false
    }

    const success = await trackClick(adData.ad.id, impressionId, {
      userId: context.userId,
      deviceType: context.deviceType,
      referrer: typeof window !== 'undefined' ? window.location.href : undefined,
    })

    if (success && adData.ad.clickUrl) {
      // Open ad URL in new tab
      window.open(adData.ad.clickUrl, '_blank', 'noopener,noreferrer')
    }

    return success
  }, [adData.ad, impressionId, context, trackClick])

  return {
    ...adData,
    impressionId,
    handleAdClick,
    isTrackingImpression,
    isTrackingClick,
  }
}

/**
 * Simple hook for ad operations without auto-tracking
 */
export function useAds() {
  const { trackImpression, isTracking: isTrackingImpression } = useTrackImpression()
  const { trackClick, isTracking: isTrackingClick } = useTrackClick()

  // Generate session ID once
  const sessionIdRef = useRef<string>(
    typeof window !== 'undefined' ? `session-${Date.now()}-${Math.random()}` : 'session-ssr'
  )

  const fetchAd = useCallback(
    async (
      placement: AdPlacement,
      context: AdContext = {}
    ): Promise<{
      ad: Advertisement | null
      reason?: string
      frequencyCapped: boolean
    }> => {
      try {
        // Get session ad data
        const sessionKey = `ad-session-${placement}`
        const sessionData: SessionAdData = JSON.parse(
          sessionStorage.getItem(sessionKey) || '{"sessionImpressions": 0, "impressionIds": {}}'
        )

        const result = await fetchAdUseCase.execute({
          placement,
          context,
          sessionId: sessionIdRef.current,
          lastAdTimestamp: sessionData.lastAdTimestamp
            ? new Date(sessionData.lastAdTimestamp)
            : undefined,
          sessionImpressions: sessionData.sessionImpressions,
        })

        // Update session data
        if (result.ad.ad) {
          sessionData.lastAdTimestamp = new Date()
          sessionData.sessionImpressions += 1
          sessionStorage.setItem(sessionKey, JSON.stringify(sessionData))
        }

        return {
          ad: result.ad.ad,
          reason: result.ad.reason,
          frequencyCapped: result.frequencyCapped,
        }
      } catch (error) {
        console.error('[useAds.fetchAd] Error:', error)
        return {
          ad: null,
          reason: 'error',
          frequencyCapped: false,
        }
      }
    },
    []
  )

  const trackImpressionSimple = useCallback(
    async (params: {
      adId: string
      placement: AdPlacement
      wasVisible: boolean
      visibilityDurationMs: number
      userId?: string
      country?: string
      deviceType?: 'mobile' | 'tablet' | 'desktop'
    }): Promise<{
      impressionId: string
      success: boolean
      fraudDetection?: {
        riskScore: number
        flags: string[]
      }
    }> => {
      const impressionId = await trackImpression(params.adId, params.placement, {
        userId: params.userId,
        country: params.country,
        deviceType: params.deviceType,
        wasVisible: params.wasVisible,
        visibilityDurationMs: params.visibilityDurationMs,
      })

      return {
        impressionId: impressionId || '',
        success: !!impressionId,
        // TODO: Include fraud detection data from use case response
      }
    },
    [trackImpression]
  )

  const trackClickSimple = useCallback(
    async (params: {
      adId: string
      impressionId: string
      userId?: string
      deviceType?: 'mobile' | 'tablet' | 'desktop'
    }): Promise<{
      success: boolean
      error?: string
      fraudDetection?: {
        riskScore: number
        flags: string[]
      }
    }> => {
      const success = await trackClick(params.adId, params.impressionId, {
        userId: params.userId,
        deviceType: params.deviceType,
        referrer: typeof window !== 'undefined' ? window.location.href : undefined,
      })

      return {
        success,
        error: success ? undefined : 'Click tracking failed',
        // TODO: Include fraud detection data from use case response
      }
    },
    [trackClick]
  )

  return {
    fetchAd,
    trackImpression: trackImpressionSimple,
    trackClick: trackClickSimple,
    isTrackingImpression,
    isTrackingClick,
  }
}

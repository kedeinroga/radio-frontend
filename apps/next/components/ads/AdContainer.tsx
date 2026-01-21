'use client'

/**
 * Ad Container Component
 * 
 * Fetches and displays ads with automatic tracking:
 * - Fetches ads based on placement
 * - Handles impression tracking
 * - Handles click tracking with CSRF
 * - Shows loading/error states
 */

import { useEffect, useState } from 'react'
import type { Advertisement, AdPlacement } from '@radio-app/app'
import { useAds } from '../../hooks/useAds'
import { BannerAd } from './BannerAd'
import { NativeAd } from './NativeAd'

export interface AdContainerProps {
  /** Placement where ad will be shown */
  placement: AdPlacement
  /** Ad format to display */
  format?: 'banner' | 'native'
  /** Native ad variant (if format is native) */
  nativeVariant?: 'card' | 'list' | 'compact'
  /** Custom className */
  className?: string
  /** User context for targeting */
  context?: {
    userId?: string
    country?: string
    language?: string
    genre?: string
    stationId?: string
    deviceType?: 'mobile' | 'tablet' | 'desktop'
  }
}

export function AdContainer({
  placement,
  format = 'banner',
  nativeVariant = 'card',
  className = '',
  context = {},
}: AdContainerProps) {
  const { fetchAd, trackImpression, trackClick } = useAds()
  const [ad, setAd] = useState<Advertisement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [impressionId, setImpressionId] = useState<string | null>(null)

  /**
   * Fetch ad on mount
   */
  useEffect(() => {
    let isMounted = true

    const loadAd = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchAd(placement, context)

        if (!isMounted) return

        if (result.ad) {
          setAd(result.ad)
        } else {
          setError(result.reason || 'No ads available')
        }
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Failed to load ad')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadAd()

    return () => {
      isMounted = false
    }
  }, [placement, fetchAd, context])

  /**
   * Handle impression tracking
   */
  const handleImpression = async (impressionData: {
    adId: string
    wasVisible: boolean
    visibilityDurationMs: number
  }) => {
    if (!ad) return

    try {
      const result = await trackImpression({
        adId: impressionData.adId,
        placement,
        wasVisible: impressionData.wasVisible,
        visibilityDurationMs: impressionData.visibilityDurationMs,
      })

      if (result.impressionId) {
        setImpressionId(result.impressionId)
      }

      // Log fraud detection result if present
      if (result.fraudDetection && result.fraudDetection.riskScore > 0) {
        console.log('[AdContainer] Impression tracked with risk score:', {
          adId: impressionData.adId,
          riskScore: result.fraudDetection.riskScore,
          flags: result.fraudDetection.flags,
        })
      }
    } catch (err) {
      console.error('[AdContainer] Failed to track impression:', err)
    }
  }

  /**
   * Handle click tracking
   */
  const handleClick = async (adId: string) => {
    if (!impressionId) {
      console.warn('[AdContainer] Cannot track click without impressionId')
      return
    }

    try {
      const result = await trackClick({
        adId,
        impressionId,
      })

      // Log fraud detection result if present
      if (result.fraudDetection && result.fraudDetection.riskScore > 0) {
        console.log('[AdContainer] Click tracked with risk score:', {
          adId,
          riskScore: result.fraudDetection.riskScore,
          flags: result.fraudDetection.flags,
        })
      }

      if (!result.success) {
        console.error('[AdContainer] Click tracking failed:', result.error)
      }
    } catch (err) {
      console.error('[AdContainer] Failed to track click:', err)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`ad-container ad-container--loading ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: format === 'banner' ? '250px' : '150px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e0e0e0',
            borderTopColor: '#666',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    )
  }

  // Error or no ad state
  if (error || !ad) {
    // Silently fail - don't show anything if no ads available
    return null
  }

  // Render ad based on format
  if (format === 'native') {
    return (
      <NativeAd
        ad={ad}
        placement={placement}
        onImpression={handleImpression}
        onClick={handleClick}
        className={className}
        variant={nativeVariant}
      />
    )
  }

  // Default: banner
  return (
    <BannerAd
      ad={ad}
      placement={placement}
      onImpression={handleImpression}
      onClick={handleClick}
      className={className}
    />
  )
}

// Add spinner animation to global styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `
  document.head.appendChild(style)
}

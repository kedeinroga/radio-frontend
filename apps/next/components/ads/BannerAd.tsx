'use client'

/**
 * Banner Ad Component
 * 
 * Displays banner advertisements with:
 * - Viewability tracking using Intersection Observer
 * - Click tracking with fraud detection
 * - Responsive sizing based on device
 * - XSS-safe rendering
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import type { Advertisement } from '@radio-app/app'
import { sanitizeAdUrl } from '@radio-app/app'

export interface BannerAdProps {
  /** Advertisement data (already sanitized by repository) */
  ad: Advertisement
  /** Placement identifier */
  placement: string
  /** Callback when ad becomes viewable */
  onImpression?: (impressionData: {
    adId: string
    wasVisible: boolean
    visibilityDurationMs: number
  }) => void
  /** Callback when ad is clicked */
  onClick?: (adId: string) => void
  /** Custom className for styling */
  className?: string
  /** Viewability threshold (0-1, default 0.5 = 50% visible) */
  viewabilityThreshold?: number
  /** Minimum time visible to count as viewable (ms, default 1000) */
  minViewableTime?: number
}

export function BannerAd({
  ad,
  placement,
  onImpression,
  onClick,
  className = '',
  viewabilityThreshold = 0.5,
  minViewableTime = 1000,
}: BannerAdProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false)
  const visibilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const visibilityStartTimeRef = useRef<number | null>(null)
  const totalVisibilityDurationRef = useRef(0)

  /**
   * Handle ad click with sanitization check
   */
  const handleClick = useCallback(() => {
    if (!ad.clickUrl || ad.clickUrl === '#') {

      return
    }

    // Double-check URL safety before opening
    const safeUrl = sanitizeAdUrl(ad.clickUrl)
    if (safeUrl === '#') {

      return
    }

    // Call onClick callback for tracking
    onClick?.(ad.id)

    // Open in new tab
    window.open(safeUrl, '_blank', 'noopener,noreferrer')
  }, [ad.id, ad.clickUrl, onClick])

  /**
   * Track impression when ad becomes viewable
   */
  const trackImpression = useCallback(() => {
    if (hasTrackedImpression) return

    const visibilityDuration = totalVisibilityDurationRef.current

    onImpression?.({
      adId: ad.id,
      wasVisible: true,
      visibilityDurationMs: visibilityDuration,
    })

    setHasTrackedImpression(true)
  }, [ad.id, hasTrackedImpression, onImpression])

  /**
   * Set up Intersection Observer for viewability tracking
   */
  useEffect(() => {
    if (!adRef.current || hasTrackedImpression) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Ad became visible
          if (entry.isIntersecting && entry.intersectionRatio >= viewabilityThreshold) {
            setIsVisible(true)

            // Start viewability timer
            if (!visibilityTimerRef.current) {
              visibilityStartTimeRef.current = Date.now()

              visibilityTimerRef.current = setTimeout(() => {
                // Ad has been visible for minimum time
                const duration = Date.now() - (visibilityStartTimeRef.current || 0)
                totalVisibilityDurationRef.current += duration
                trackImpression()
              }, minViewableTime)
            }
          }
          // Ad became not visible
          else if (!entry.isIntersecting) {
            setIsVisible(false)

            // Clear viewability timer if running
            if (visibilityTimerRef.current) {
              clearTimeout(visibilityTimerRef.current)
              visibilityTimerRef.current = null

              // Accumulate partial visibility time
              if (visibilityStartTimeRef.current) {
                const duration = Date.now() - visibilityStartTimeRef.current
                totalVisibilityDurationRef.current += duration
                visibilityStartTimeRef.current = null
              }
            }
          }
        })
      },
      {
        threshold: viewabilityThreshold,
        rootMargin: '0px',
      }
    )

    observer.observe(adRef.current)

    return () => {
      if (adRef.current) {
        observer.unobserve(adRef.current)
      }
      if (visibilityTimerRef.current) {
        clearTimeout(visibilityTimerRef.current)
      }
    }
  }, [hasTrackedImpression, viewabilityThreshold, minViewableTime, trackImpression])

  // Get dimensions with fallback
  const width = ad.width || 300
  const height = ad.height || 250

  return (
    <div
      ref={adRef}
      className={`banner-ad ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: `${width}px`,
        aspectRatio: `${width} / ${height}`,
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: '8px',
        backgroundColor: '#f5f5f5',
      }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label={`Advertisement: ${ad.title}`}
    >
      {/* Ad Image */}
      {ad.mediaUrl && ad.adType === 'image' && (
        <Image
          src={ad.mediaUrl}
          alt={ad.title}
          fill
          style={{ objectFit: 'cover' }}
          sizes={`(max-width: ${width}px) 100vw, ${width}px`}
          priority={placement.includes('home') || placement.includes('player')}
        />
      )}

      {/* Ad Title Overlay (optional) */}
      {ad.title && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '8px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            color: 'white',
            fontSize: '12px',
            fontWeight: '500',
          }}
        >
          {ad.title}
        </div>
      )}

      {/* Viewability indicator (dev only) */}
      {process.env.NODE_ENV === 'development' && isVisible && (
        <div
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            padding: '2px 6px',
            backgroundColor: 'rgba(0, 255, 0, 0.8)',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
            borderRadius: '4px',
          }}
        >
          VIEWABLE
        </div>
      )}

      {/* Ad label (required by advertising guidelines) */}
      <div
        style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          padding: '2px 6px',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          fontSize: '10px',
          fontWeight: '500',
          borderRadius: '4px',
          textTransform: 'uppercase',
        }}
      >
        Ad
      </div>
    </div>
  )
}

'use client'

/**
 * Native Ad Component
 * 
 * Displays native advertisements that blend with content:
 * - Matches app's design language
 * - Viewability tracking
 * - Click tracking with fraud detection
 * - XSS-safe rendering
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import type { Advertisement } from '@radio-app/app'
import { sanitizeAdUrl, sanitizeAdText } from '@radio-app/app'

export interface NativeAdProps {
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
  /** Layout variant */
  variant?: 'card' | 'list' | 'compact'
  /** Viewability threshold (0-1, default 0.5 = 50% visible) */
  viewabilityThreshold?: number
  /** Minimum time visible to count as viewable (ms, default 1000) */
  minViewableTime?: number
}

export function NativeAd({
  ad,
  placement: _placement, // Used for analytics context
  onImpression,
  onClick,
  className = '',
  variant = 'card',
  viewabilityThreshold = 0.5,
  minViewableTime = 1000,
}: NativeAdProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false)
  const visibilityTimerRef = useRef<NodeJS.Timeout | null>(null)
  const visibilityStartTimeRef = useRef<number | null>(null)
  const totalVisibilityDurationRef = useRef(0)

  /**
   * Handle ad click with sanitization check
   */
  const handleClick = useCallback(() => {
    if (!ad.clickUrl || ad.clickUrl === '#') {
      console.warn('[NativeAd] Invalid click URL, click blocked')
      return
    }

    // Double-check URL safety before opening
    const safeUrl = sanitizeAdUrl(ad.clickUrl)
    if (safeUrl === '#') {
      console.warn('[NativeAd] Unsafe URL detected, click blocked')
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

  // Safely render text content
  const safeTitle = sanitizeAdText(ad.title)
  const safeDescription = ad.description ? sanitizeAdText(ad.description) : undefined
  const safeAdvertiserName = sanitizeAdText(ad.advertiserName)

  // Render based on variant
  if (variant === 'compact') {
    return (
      <div
        ref={adRef}
        className={`native-ad native-ad--compact ${className}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
      >
        {/* Ad Image */}
        {ad.mediaUrl && (
          <div
            style={{
              position: 'relative',
              width: '60px',
              height: '60px',
              flexShrink: 0,
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#e0e0e0',
            }}
          >
            <Image
              src={ad.mediaUrl}
              alt={safeTitle}
              fill
              style={{ objectFit: 'cover' }}
              sizes="60px"
            />
          </div>
        )}

        {/* Ad Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {safeTitle}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: '#666',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Sponsored • {safeAdvertiserName}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div
        ref={adRef}
        className={`native-ad native-ad--list ${className}`}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
        style={{
          display: 'flex',
          gap: '16px',
          padding: '16px',
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'box-shadow 0.2s',
        }}
      >
        {/* Ad Image */}
        {ad.mediaUrl && (
          <div
            style={{
              position: 'relative',
              width: '120px',
              height: '120px',
              flexShrink: 0,
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#f0f0f0',
            }}
          >
            <Image
              src={ad.mediaUrl}
              alt={safeTitle}
              fill
              style={{ objectFit: 'cover' }}
              sizes="120px"
            />
          </div>
        )}

        {/* Ad Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
            }}
          >
            Sponsored
          </div>
          <div
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '8px',
              lineHeight: '1.4',
            }}
          >
            {safeTitle}
          </div>
          {safeDescription && (
            <div
              style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.5',
                marginBottom: '8px',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {safeDescription}
            </div>
          )}
          <div
            style={{
              fontSize: '12px',
              color: '#999',
            }}
          >
            {safeAdvertiserName}
          </div>
        </div>
      </div>
    )
  }

  // Default: card variant
  return (
    <div
      ref={adRef}
      className={`native-ad native-ad--card ${className}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* Ad Image */}
      {ad.mediaUrl && (
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%', // 16:9 aspect ratio
            backgroundColor: '#f0f0f0',
          }}
        >
          <Image
            src={ad.mediaUrl}
            alt={safeTitle}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 400px"
          />
          {/* Sponsored badge */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              padding: '4px 8px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              fontSize: '11px',
              fontWeight: '600',
              borderRadius: '4px',
              textTransform: 'uppercase',
            }}
          >
            Sponsored
          </div>
        </div>
      )}

      {/* Ad Content */}
      <div style={{ padding: '16px' }}>
        <div
          style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '8px',
            lineHeight: '1.4',
          }}
        >
          {safeTitle}
        </div>
        {safeDescription && (
          <div
            style={{
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.5',
              marginBottom: '12px',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {safeDescription}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              color: '#999',
            }}
          >
            {safeAdvertiserName}
          </div>
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '6px',
            }}
          >
            Learn More
          </div>
        </div>
      </div>
    </div>
  )
}

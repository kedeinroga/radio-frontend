/**
 * Interstitial Ad Component
 * 
 * Full-screen ad that appears between content transitions.
 * - Appears after station changes (configurable frequency)
 * - Countdown timer with skip option
 * - Tracks impressions and clicks
 * - Respects premium users (no ads)
 */

'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { sanitizeAdUrl } from '@radio-app/app'
import type { Advertisement } from '@radio-app/app'

export interface InterstitialAdProps {
  /** Advertisement data */
  ad: Advertisement
  /** Callback when ad is closed/completed */
  onClose: () => void
  /** Callback when ad impression is tracked */
  onImpression?: (adId: string) => void
  /** Callback when ad is clicked */
  onClick?: (adId: string) => void
  /** Seconds before skip button appears (default: 5) */
  skipAfter?: number
  /** Auto-close after duration (seconds, default: 15) */
  autoCloseAfter?: number
}

export function InterstitialAd({
  ad,
  onClose,
  onImpression,
  onClick,
  skipAfter = 5,
  autoCloseAfter = 15,
}: InterstitialAdProps) {
  const [timeLeft, setTimeLeft] = useState(autoCloseAfter)
  const [canSkip, setCanSkip] = useState(false)
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false)

  // Track impression on mount
  useEffect(() => {
    if (!hasTrackedImpression) {
      onImpression?.(ad.id)
      setHasTrackedImpression(true)
    }
  }, [ad.id, hasTrackedImpression, onImpression])

  // Enable skip button after delay
  useEffect(() => {
    const skipTimer = setTimeout(() => {
      setCanSkip(true)
    }, skipAfter * 1000)

    return () => clearTimeout(skipTimer)
  }, [skipAfter])

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      onClose()
      return
    }

    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [timeLeft, onClose])

  // Prevent body scroll when interstitial is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleClick = () => {
    onClick?.(ad.id)
    
    // Open ad URL in new tab
    const sanitizedUrl = sanitizeAdUrl(ad.clickUrl || '')
    if (sanitizedUrl) {
      window.open(sanitizedUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const handleSkip = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
      {/* Close button (top right) */}
      {canSkip && (
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
          aria-label="Cerrar anuncio"
        >
          <X size={24} />
        </button>
      )}

      {/* Ad content */}
      <div className="max-w-4xl w-full mx-4 space-y-4">
        {/* Ad label */}
        <div className="text-center">
          <span className="text-sm text-neutral-400 uppercase tracking-wider">
            Publicidad
          </span>
        </div>

        {/* Ad image */}
        <button
          onClick={handleClick}
          className="block w-full cursor-pointer hover:opacity-90 transition-opacity rounded-lg overflow-hidden"
        >
          <Image
            src={ad.mediaUrl || ''}
            alt={ad.title}
            width={ad.width || 1200}
            height={ad.height || 628}
            className="w-full h-auto"
            priority
            unoptimized
          />
        </button>

        {/* Ad info and timer */}
        <div className="flex items-center justify-between text-white">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">{ad.title}</h3>
            {ad.description && (
              <p className="text-sm text-neutral-400">{ad.description}</p>
            )}
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold">{timeLeft}s</div>
            {!canSkip && (
              <div className="text-xs text-neutral-400">
                Omitir en {skipAfter - (autoCloseAfter - timeLeft)}s
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-neutral-700 rounded-full h-1">
          <div
            className="bg-primary-500 h-1 rounded-full transition-all duration-1000"
            style={{
              width: `${((autoCloseAfter - timeLeft) / autoCloseAfter) * 100}%`,
            }}
          />
        </div>

        {/* Skip button */}
        {canSkip && (
          <button
            onClick={handleSkip}
            className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-neutral-100 transition-colors"
          >
            Saltar anuncio
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Hook to manage interstitial ad display frequency
 */
export function useInterstitialAd() {
  const [shouldShowAd, setShouldShowAd] = useState(false)
  const [adsShownCount, setAdsShownCount] = useState(0)

  // Frequency: Show ad every N station changes
  const SHOW_AD_EVERY_N_CHANGES = 3

  const maybeShowAd = () => {
    const newCount = adsShownCount + 1
    setAdsShownCount(newCount)

    if (newCount % SHOW_AD_EVERY_N_CHANGES === 0) {
      setShouldShowAd(true)
      return true
    }

    return false
  }

  const hideAd = () => {
    setShouldShowAd(false)
  }

  return {
    shouldShowAd,
    maybeShowAd,
    hideAd,
    adsShownCount,
  }
}

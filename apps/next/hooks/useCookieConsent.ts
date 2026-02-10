import { useState, useEffect, useCallback } from 'react'

export interface CookieConsent {
  essential: boolean // Always true
  analytics: boolean
  advertising: boolean
}

const CONSENT_KEY = 'rradio_cookie_consent'
const CONSENT_GIVEN_KEY = 'rradio_consent_given'

/**
 * Hook for managing cookie consent state
 * Compliant with GDPR/CCPA requirements
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  const [hasGivenConsent, setHasGivenConsent] = useState<boolean>(false)
  const [showBanner, setShowBanner] = useState<boolean>(false)

  // Load consent from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedConsent = localStorage.getItem(CONSENT_KEY)
    const consentGiven = localStorage.getItem(CONSENT_GIVEN_KEY)

    if (storedConsent && consentGiven) {
      setConsent(JSON.parse(storedConsent))
      setHasGivenConsent(true)
      setShowBanner(false)
    } else {
      // Show banner if no consent has been given
      setShowBanner(true)
    }
  }, [])

  /**
   * Save consent preferences
   */
  const saveConsent = useCallback((newConsent: Partial<CookieConsent>) => {
    const fullConsent: CookieConsent = {
      essential: true, // Always true
      analytics: newConsent.analytics ?? false,
      advertising: newConsent.advertising ?? false,
    }

    localStorage.setItem(CONSENT_KEY, JSON.stringify(fullConsent))
    localStorage.setItem(CONSENT_GIVEN_KEY, 'true')
    setConsent(fullConsent)
    setHasGivenConsent(true)
    setShowBanner(false)

    // Reload page to apply AdSense if advertising was enabled
    if (fullConsent.advertising) {
      window.location.reload()
    }
  }, [])

  /**
   * Accept all cookies
   */
  const acceptAll = useCallback(() => {
    saveConsent({
      analytics: true,
      advertising: true,
    })
  }, [saveConsent])

  /**
   * Reject non-essential cookies
   */
  const rejectAll = useCallback(() => {
    saveConsent({
      analytics: false,
      advertising: false,
    })
  }, [saveConsent])

  /**
   * Reset consent (for testing)
   */
  const resetConsent = useCallback(() => {
    localStorage.removeItem(CONSENT_KEY)
    localStorage.removeItem(CONSENT_GIVEN_KEY)
    setConsent(null)
    setHasGivenConsent(false)
    setShowBanner(true)
  }, [])

  return {
    consent,
    hasGivenConsent,
    showBanner,
    saveConsent,
    acceptAll,
    rejectAll,
    resetConsent,
  }
}

'use client'

import { useEffect } from 'react'

/**
 * AdSenseLoader — injects the AdSense script ONLY after the user
 * has given advertising consent (stored in localStorage by useCookieConsent).
 *
 * This ensures GDPR/CCPA compliance: no tracking scripts run before consent.
 */
export function AdSenseLoader() {
  const adsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID

  useEffect(() => {
    if (!adsenseId) return

    // Read consent from localStorage (written by useCookieConsent hook)
    let advertising = false
    try {
      const raw = localStorage.getItem('rradio_cookie_consent')
      if (raw) {
        const consent = JSON.parse(raw)
        advertising = consent?.advertising === true
      }
    } catch {
      // localStorage unavailable or malformed — default to no consent
    }

    if (!advertising) return

    // Avoid injecting the script more than once
    if (document.getElementById('adsense-script')) return

    const script = document.createElement('script')
    script.id = 'adsense-script'
    script.async = true
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`
    script.crossOrigin = 'anonymous'
    document.head.appendChild(script)
  }, [adsenseId])

  return null
}

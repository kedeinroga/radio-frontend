/**
 * Web Vitals Provider
 * 
 * Initializes Core Web Vitals monitoring on app startup.
 * Add this to your root layout to enable performance tracking.
 * 
 * Usage:
 * ```tsx
 * // In app/layout.tsx
 * import { WebVitalsProvider } from '@/components/WebVitalsProvider'
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <WebVitalsProvider />
 *         {children}
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */

'use client'

import { useEffect } from 'react'
import { WebVitalsReporter } from '@/lib/webVitals'

export function WebVitalsProvider() {
  useEffect(() => {
    // Initialize web vitals monitoring
    WebVitalsReporter.init()

    // Log summary after 10 seconds (development only)
    if (process.env.NODE_ENV === 'development') {
      const timeout = setTimeout(() => {
        WebVitalsReporter.logSummary()
      }, 10000)

      return () => {
        clearTimeout(timeout)
        WebVitalsReporter.cleanup()
      }
    }

    return () => {
      WebVitalsReporter.cleanup()
    }
  }, [])

  return null // No UI
}

'use client'

import { useEffect } from 'react'
import { 
  WebVitalsReporter, 
  GoogleAnalyticsProvider, 
  ConsoleProvider, 
  CustomEndpointProvider,
  type AnalyticsProvider
} from '@/lib/webVitals'
import { SpeedInsights } from '@vercel/speed-insights/next'

export function WebVitals() {
  useEffect(() => {
    const providers: AnalyticsProvider[] = []

    // Add Google Analytics Provider
    // It safely checks for window.gtag internally
    providers.push(new GoogleAnalyticsProvider())

    // Add Custom Endpoint Provider if configured
    const customEndpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT
    if (customEndpoint) {
      providers.push(new CustomEndpointProvider(customEndpoint))
    }

    // Add Console Provider in development
    if (process.env.NODE_ENV === 'development') {
      providers.push(new ConsoleProvider())
    }

    // Initialize the reporter with the configured providers
    WebVitalsReporter.init(providers)
  }, [])

  return <SpeedInsights />
}

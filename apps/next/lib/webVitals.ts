/**
 * Core Web Vitals Monitoring
 * 
 * Tracks and reports Core Web Vitals metrics to analytics.
 * Uses Strategy Pattern to decouple metrics collection from reporting.
 */

'use client'

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'

/**
 * Enhanced metric with additional context
 */
export interface EnhancedMetric {
  id: string
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  path: string
  userAgent: string
  timestamp: number
  delta: number
  navigationType: string
}

/**
 * Analytics Provider Interface (Strategy)
 */
export interface AnalyticsProvider {
  name: string
  send(metric: EnhancedMetric): void
}

/**
 * Thresholds for Core Web Vitals
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
} as const

function getRating(metricName: string, value: number): EnhancedMetric['rating'] {
  const threshold = WEB_VITALS_THRESHOLDS[metricName as keyof typeof WEB_VITALS_THRESHOLDS]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

/**
 * Google Analytics Provider
 */
export class GoogleAnalyticsProvider implements AnalyticsProvider {
  name = 'GoogleAnalytics'

  send(metric: EnhancedMetric): void {
    if (typeof window === 'undefined' || typeof window.gtag === 'undefined') return

    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      non_interaction: true,
      metric_rating: metric.rating,
      page_path: metric.path,
    })
  }
}

/**
 * Custom Endpoint Provider
 */
export class CustomEndpointProvider implements AnalyticsProvider {
  name = 'CustomEndpoint'
  private endpoint: string

  constructor(endpoint: string) {
    this.endpoint = endpoint
  }

  send(metric: EnhancedMetric): void {
    if (typeof window === 'undefined') return

    // Use navigator.sendBeacon if available for better reliability on unload
    const body = JSON.stringify({
      type: 'web-vital',
      metric: {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        path: metric.path,
        timestamp: metric.timestamp,
      },
    })

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon(this.endpoint, blob)
    } else {
      fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => { })
    }
  }
}

/**
 * Console Logger Provider (for Development)
 */
export class ConsoleProvider implements AnalyticsProvider {
  name = 'Console'

  send(metric: EnhancedMetric): void {
    console.group(`[Web Vitals] ${metric.name}`)
    console.log(`Value: ${metric.value.toFixed(2)}`)
    console.log(`Rating: ${metric.rating}`)
    console.log(`ID: ${metric.id}`)
    console.log(`Delta: ${metric.delta}`)
    console.groupEnd()
  }
}

/**
 * Web Vitals Reporter (Context)
 */
export class WebVitalsReporter {
  private static providers: AnalyticsProvider[] = []
  private static isInitialized = false

  static init(providers: AnalyticsProvider[]) {
    if (this.isInitialized || typeof window === 'undefined') return

    this.providers = providers
    this.isInitialized = true

    // Register metric listeners
    onCLS(this.handleMetric.bind(this))
    onFCP(this.handleMetric.bind(this))
    onINP(this.handleMetric.bind(this))
    onLCP(this.handleMetric.bind(this))
    onTTFB(this.handleMetric.bind(this))
  }

  private static handleMetric(metric: Metric) {
    const enhanced: EnhancedMetric = {
      id: metric.id,
      name: metric.name,
      value: metric.value,
      rating: getRating(metric.name, metric.value),
      path: window.location.pathname,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      delta: metric.delta,
      navigationType: metric.navigationType || 'unknown',
    }

    this.providers.forEach(provider => {
      try {
        provider.send(enhanced)
      } catch (e) {
        console.error(`[WebVitals] Error in provider ${provider.name}:`, e)
      }
    })
  }
}

// Global type definitions
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

/**
 * Core Web Vitals Monitoring
 * 
 * Tracks and reports Core Web Vitals metrics to analytics.
 * Integrates with Google Analytics, Vercel Analytics, or custom endpoints.
 * 
 * Metrics tracked:
 * - LCP (Largest Contentful Paint): Loading performance
 * - FID (First Input Delay): Interactivity
 * - CLS (Cumulative Layout Shift): Visual stability
 * - FCP (First Contentful Paint): Initial render
 * - TTFB (Time to First Byte): Server response
 * - INP (Interaction to Next Paint): Responsiveness (new)
 * 
 * Usage:
 * ```tsx
 * // In app/layout.tsx or _app.tsx
 * import { WebVitalsReporter } from '@/lib/webVitals'
 * 
 * export function reportWebVitals(metric) {
 *   WebVitalsReporter.report(metric)
 * }
 * ```
 */

'use client'

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'

/**
 * Thresholds for Core Web Vitals (from Google)
 * 
 * Good: Green (optimal)
 * Needs Improvement: Yellow (acceptable)
 * Poor: Red (needs attention)
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint (ms)
  FID: { good: 100, poor: 300 },   // First Input Delay (ms)
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift (score)
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint (ms)
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte (ms)
  INP: { good: 200, poor: 500 },   // Interaction to Next Paint (ms)
} as const

/**
 * Rating based on thresholds
 */
type Rating = 'good' | 'needs-improvement' | 'poor'

/**
 * Get rating for a metric value
 */
function getRating(metricName: string, value: number): Rating {
  const threshold = WEB_VITALS_THRESHOLDS[metricName as keyof typeof WEB_VITALS_THRESHOLDS]
  if (!threshold) return 'good'
  
  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

/**
 * Enhanced metric with additional context
 */
interface EnhancedMetric {
  id: string
  name: string
  value: number
  rating: Rating
  path: string
  userAgent: string
  timestamp: number
  delta: number
  navigationType: string
}

/**
 * Web Vitals Reporter
 */
export class WebVitalsReporter {
  private static metrics: EnhancedMetric[] = []
  private static reportQueue: EnhancedMetric[] = []
  private static flushInterval: ReturnType<typeof setInterval> | null = null

  /**
   * Initialize web vitals monitoring
   * 
   * Call this once on app initialization.
   */
  static init() {
    if (typeof window === 'undefined') return

    // Collect all metrics (v4 API)
    onCLS(this.handleMetric.bind(this))
    onFCP(this.handleMetric.bind(this))
    onINP(this.handleMetric.bind(this)) // Replaces FID in v4
    onLCP(this.handleMetric.bind(this))
    onTTFB(this.handleMetric.bind(this))

    // Flush queue every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flush()
    }, 30000)

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush()
      })
    }

    // WebVitals monitoring initialized
  }

  /**
   * Handle a web vitals metric
   */
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

    this.metrics.push(enhanced)
    this.reportQueue.push(enhanced)

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      this.logMetric(enhanced)
    }

    // Send to analytics immediately for poor metrics
    if (enhanced.rating === 'poor') {
      this.sendToAnalytics(enhanced)
    }
  }

  /**
   * Report a metric (public API for Next.js reportWebVitals)
   */
  static report(metric: Metric) {
    this.handleMetric(metric)
  }

  /**
   * Log metric to console (development only)
   */
  private static logMetric(_metric: EnhancedMetric) {
    // Metric logging silenced
  }

  /**
   * Send metric to analytics services
   */
  private static async sendToAnalytics(metric: EnhancedMetric) {
    if (typeof window === 'undefined') return

    // Google Analytics (gtag)
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
        metric_rating: metric.rating,
        page_path: metric.path,
      })
    }

    // Vercel Analytics
    if (typeof window.va !== 'undefined') {
      window.va('event', {
        name: `web-vital-${metric.name}`,
        data: {
          value: metric.value,
          rating: metric.rating,
          path: metric.path,
        },
      })
    }

    // Custom analytics endpoint (optional)
    if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
      try {
        await fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'web-vital',
            metric: {
              name: metric.name,
              value: metric.value,
              rating: metric.rating,
              path: metric.path,
              timestamp: metric.timestamp,
            },
          }),
          keepalive: true, // Important for beforeunload
        })
      } catch (error) {
        // Failed to send metric
      }
    }
  }

  /**
   * Flush queued metrics to analytics
   */
  private static flush() {
    if (this.reportQueue.length === 0) return

    const metricsToSend = [...this.reportQueue]
    this.reportQueue = []

    metricsToSend.forEach((metric) => {
      this.sendToAnalytics(metric)
    })
  }

  /**
   * Get all collected metrics
   */
  static getMetrics(): EnhancedMetric[] {
    return [...this.metrics]
  }

  /**
   * Get metrics summary
   */
  static getSummary() {
    const summary: Record<string, { count: number; avg: number; min: number; max: number; good: number; poor: number }> = {}

    this.metrics.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = { count: 0, avg: 0, min: Infinity, max: 0, good: 0, poor: 0 }
      }

      const s = summary[metric.name]
      s.count++
      s.avg = (s.avg * (s.count - 1) + metric.value) / s.count
      s.min = Math.min(s.min, metric.value)
      s.max = Math.max(s.max, metric.value)
      if (metric.rating === 'good') s.good++
      if (metric.rating === 'poor') s.poor++
    })

    return summary
  }

  /**
   * Log summary to console
   */
  static logSummary() {
    // Summary logging silenced
  }

  /**
   * Clear all metrics (useful for testing)
   */
  static clear() {
    this.metrics = []
    this.reportQueue = []
  }

  /**
   * Cleanup (call on unmount)
   */
  static cleanup() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }
    this.flush()
  }
}

// Type definitions for global analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    va?: (...args: any[]) => void
  }
}

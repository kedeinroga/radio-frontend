/**
 * Analytics Service Interface
 * Abstraction for analytics tracking
 */
export interface IAnalyticsService {
  /**
   * Track an event
   */
  track(event: string, properties?: Record<string, any>): Promise<void>

  /**
   * Identify a user
   */
  identify(userId: string, traits?: Record<string, any>): Promise<void>

  /**
   * Track a page view
   */
  trackPageView(pageName: string, properties?: Record<string, any>): Promise<void>

  /**
   * Track screen view (mobile)
   */
  trackScreenView(screenName: string, properties?: Record<string, any>): Promise<void>

  /**
   * Reset analytics (on logout)
   */
  reset(): Promise<void>
}

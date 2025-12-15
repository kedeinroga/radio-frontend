import { IAnalyticsService } from '../../application/ports/IAnalyticsService'

/**
 * Mock Analytics Service
 * Simple analytics implementation for development
 * Will be replaced with Mixpanel in production
 */
export class MockAnalyticsService implements IAnalyticsService {
  private isDevelopment = process.env.NODE_ENV === 'development'

  async track(event: string, properties?: Record<string, any>): Promise<void> {
    if (this.isDevelopment) {
      console.log(`[Analytics] Track: ${event}`, properties)
    }
  }

  async identify(userId: string, traits?: Record<string, any>): Promise<void> {
    if (this.isDevelopment) {
      console.log(`[Analytics] Identify: ${userId}`, traits)
    }
  }

  async trackPageView(pageName: string, properties?: Record<string, any>): Promise<void> {
    if (this.isDevelopment) {
      console.log(`[Analytics] Page View: ${pageName}`, properties)
    }
  }

  async trackScreenView(screenName: string, properties?: Record<string, any>): Promise<void> {
    if (this.isDevelopment) {
      console.log(`[Analytics] Screen View: ${screenName}`, properties)
    }
  }

  async reset(): Promise<void> {
    if (this.isDevelopment) {
      console.log('[Analytics] Reset')
    }
  }
}

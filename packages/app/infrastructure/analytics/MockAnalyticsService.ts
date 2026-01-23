import { IAnalyticsService } from '../../application/ports/IAnalyticsService'

/**
 * Mock Analytics Service
 * Simple analytics implementation for development
 * Will be replaced with Mixpanel in production
 */
export class MockAnalyticsService implements IAnalyticsService {

  async track(_event: string, _properties?: Record<string, any>): Promise<void> {
    // Analytics tracking silenced in production
  }

  async identify(_userId: string, _traits?: Record<string, any>): Promise<void> {
    // Analytics identify silenced in production
  }

  async trackPageView(_pageName: string, _properties?: Record<string, any>): Promise<void> {
    // Analytics page view silenced in production
  }

  async trackScreenView(_screenName: string, _properties?: Record<string, any>): Promise<void> {
    // Analytics screen view silenced in production
  }

  async reset(): Promise<void> {
    // Analytics reset silenced in production
  }
}

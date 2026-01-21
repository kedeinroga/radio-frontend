/**
 * Advertisement Repository Interface
 * 
 * Defines the contract for fetching and tracking advertisements.
 * Implementations must integrate XSS sanitization on all data.
 */

import type { Advertisement } from '../entities/Advertisement'
import type { AdPlacement } from '../valueObjects/AdPlacement'

/**
 * Context for ad targeting and frequency capping
 */
export interface AdContext {
  /** User ID (if authenticated) */
  userId?: string
  /** User's country code (ISO 3166-1 alpha-2) */
  country?: string
  /** User's preferred language (ISO 639-1) */
  language?: string
  /** Currently playing genre */
  genre?: string
  /** Currently playing station ID */
  stationId?: string
  /** Device type for responsive ad selection */
  deviceType?: 'mobile' | 'tablet' | 'desktop'
  /** Whether user has premium subscription */
  isPremium?: boolean
}

/**
 * Impression metadata for analytics
 */
export interface ImpressionMetadata {
  /** Placement where ad was shown */
  placement: AdPlacement
  /** User ID (if authenticated) */
  userId?: string
  /** Country where impression occurred */
  country?: string
  /** Device type */
  deviceType?: 'mobile' | 'tablet' | 'desktop'
  /** Session ID for frequency capping */
  sessionId: string
  /** Timestamp when ad was shown */
  timestamp: Date
  /** Whether ad was fully visible (viewability) */
  wasVisible?: boolean
  /** Duration ad was visible (for video/audio ads) */
  visibilityDurationMs?: number
}

/**
 * Click metadata for analytics
 */
export interface ClickMetadata {
  /** Impression ID that this click belongs to */
  impressionId: string
  /** User ID (if authenticated) */
  userId?: string
  /** Device type */
  deviceType?: 'mobile' | 'tablet' | 'desktop'
  /** Timestamp when click occurred */
  timestamp: Date
  /** Referrer URL */
  referrer?: string
}

/**
 * Result of fetching an ad
 */
export interface FetchAdResult {
  /** The advertisement (null if none available) */
  ad: Advertisement | null
  /** Reason why no ad was returned */
  reason?: 'no_eligible_ads' | 'frequency_cap_reached' | 'premium_user' | 'geo_restricted'
}

/**
 * Advertisement Repository Interface
 */
export interface IAdvertisementRepository {
  /**
   * Fetch an eligible advertisement for a placement
   * 
   * @param placement Where the ad will be shown
   * @param context User and session context
   * @returns Advertisement or null with reason
   */
  fetchAdForPlacement(
    placement: AdPlacement,
    context: AdContext
  ): Promise<FetchAdResult>

  /**
   * Track an ad impression
   * 
   * @param adId Advertisement ID
   * @param metadata Impression metadata
   * @returns Impression ID for click tracking
   */
  trackImpression(
    adId: string,
    metadata: ImpressionMetadata
  ): Promise<string>

  /**
   * Track an ad click
   * 
   * @param adId Advertisement ID
   * @param metadata Click metadata
   * @returns Success status
   */
  trackClick(
    adId: string,
    metadata: ClickMetadata
  ): Promise<boolean>

  /**
   * Get user's ad profile (frequency caps, premium status)
   * 
   * @param userId User ID
   * @returns User ad profile or null if not found
   */
  getUserAdProfile(userId: string): Promise<{
    adsShownToday: number
    adsShownThisHour: number
    isPremium: boolean
    premiumUntil?: Date
  } | null>
}

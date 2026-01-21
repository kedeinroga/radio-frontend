/**
 * Advertisement API Repository Implementation
 * 
 * Implements advertisement fetching and tracking using the Go API.
 * Integrates XSS sanitization on all fetched ad data.
 */

import type {
  IAdvertisementRepository,
  AdContext,
  FetchAdResult,
  ImpressionMetadata,
  ClickMetadata,
} from '../../domain/repositories/IAdvertisementRepository'
import type { Advertisement } from '../../domain/entities/Advertisement'
import type { AdPlacement } from '../../domain/valueObjects/AdPlacement'
import { sanitizeAdvertisement, validateAdvertisementSafety } from '../utils/adSanitization'

/**
 * API Response for fetching ads
 */
interface ApiFetchAdResponse {
  advertisement?: {
    id: string
    campaign_id: string
    title: string
    description?: string
    ad_format: 'banner' | 'interstitial' | 'audio' | 'native'
    click_url: string
    media_url?: string
    media_type?: 'image' | 'video' | 'audio' | 'html'
    width?: number
    height?: number
    duration_seconds?: number
    targeting: {
      countries?: string[]
      genres?: string[]
      languages?: string[]
    }
    pricing: {
      cpm_rate_cents?: number
      cpc_rate_cents?: number
    }
    metrics: {
      impressions_count: number
      clicks_count: number
    }
    start_date: string
    end_date?: string
    is_active: boolean
  }
  reason?: 'no_eligible_ads' | 'frequency_cap_reached' | 'premium_user' | 'geo_restricted'
}

/**
 * API Response for tracking impressions
 */
interface ApiTrackImpressionResponse {
  impression_id: string
  success: boolean
}

/**
 * API Response for user ad profile
 */
interface ApiUserAdProfileResponse {
  user_id: string
  ads_shown_today: number
  ads_shown_this_hour: number
  is_premium: boolean
  premium_until?: string
}

export class AdvertisementApiRepository implements IAdvertisementRepository {
  constructor(private baseUrl: string) {}

  /**
   * Fetch an eligible advertisement for a placement
   */
  async fetchAdForPlacement(
    placement: AdPlacement,
    context: AdContext
  ): Promise<FetchAdResult> {
    try {
      const queryParams = new URLSearchParams({
        placement,
        ...(context.userId && { user_id: context.userId }),
        ...(context.country && { country: context.country }),
        ...(context.language && { language: context.language }),
        ...(context.genre && { genre: context.genre }),
        ...(context.stationId && { station_id: context.stationId }),
        ...(context.deviceType && { device_type: context.deviceType }),
        ...(context.isPremium !== undefined && { is_premium: String(context.isPremium) }),
      })

      const response = await fetch(
        `${this.baseUrl}/api/v1/ads/eligible?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        console.error('[AdvertisementApi] Failed to fetch ad:', response.statusText)
        return { ad: null, reason: 'no_eligible_ads' }
      }

      const data: ApiFetchAdResponse = await response.json()

      // No ad available
      if (!data.advertisement) {
        return { ad: null, reason: data.reason || 'no_eligible_ads' }
      }

      // Convert API response to domain entity
      const ad: Advertisement = {
        id: data.advertisement.id,
        campaignId: data.advertisement.campaign_id,
        title: data.advertisement.title,
        description: data.advertisement.description,
        advertiserName: 'Advertiser', // Default, API doesn't provide this yet
        adFormat: data.advertisement.ad_format,
        adType: data.advertisement.media_type || 'audio',
        mediaUrl: data.advertisement.media_url,
        clickUrl: data.advertisement.click_url,
        width: data.advertisement.width,
        height: data.advertisement.height,
        durationSeconds: data.advertisement.duration_seconds,
        targetCountries: data.advertisement.targeting.countries,
        targetGenres: data.advertisement.targeting.genres,
        targetLanguages: data.advertisement.targeting.languages,
        startDate: new Date(data.advertisement.start_date),
        endDate: data.advertisement.end_date ? new Date(data.advertisement.end_date) : undefined,
        cpmRateCents: data.advertisement.pricing.cpm_rate_cents,
        cpcRateCents: data.advertisement.pricing.cpc_rate_cents,
        status: data.advertisement.is_active ? 'active' : 'paused',
        priority: 50, // Default priority
        impressionsCount: data.advertisement.metrics.impressions_count,
        clicksCount: data.advertisement.metrics.clicks_count,
        spendCents: 0, // Calculated elsewhere
        createdAt: new Date(data.advertisement.start_date), // Use start_date as proxy
        updatedAt: new Date(), // Current time
      }

      // **CRITICAL: Sanitize ad content before returning (XSS Protection)**
      const sanitizedAd = sanitizeAdvertisement(ad)

      // **CRITICAL: Validate ad safety**
      const safetyCheck = validateAdvertisementSafety(sanitizedAd)
      if (!safetyCheck.valid) {
        console.error('[AdvertisementApi] Ad failed safety validation:', safetyCheck.errors)
        return { ad: null, reason: 'no_eligible_ads' }
      }

      return { ad: sanitizedAd }
    } catch (error) {
      console.error('[AdvertisementApi] Error fetching ad:', error)
      return { ad: null, reason: 'no_eligible_ads' }
    }
  }

  /**
   * Track an ad impression
   */
  async trackImpression(
    adId: string,
    metadata: ImpressionMetadata
  ): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ads/impression`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ad_id: adId,
          placement: metadata.placement,
          user_id: metadata.userId,
          country: metadata.country,
          device_type: metadata.deviceType,
          session_id: metadata.sessionId,
          timestamp: metadata.timestamp.toISOString(),
          was_visible: metadata.wasVisible,
          visibility_duration_ms: metadata.visibilityDurationMs,
        }),
      })

      if (!response.ok) {
        console.error('[AdvertisementApi] Failed to track impression:', response.statusText)
        return ''
      }

      const data: ApiTrackImpressionResponse = await response.json()
      return data.impression_id
    } catch (error) {
      console.error('[AdvertisementApi] Error tracking impression:', error)
      return ''
    }
  }

  /**
   * Track an ad click
   */
  async trackClick(
    adId: string,
    metadata: ClickMetadata
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/ads/click`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ad_id: adId,
          impression_id: metadata.impressionId,
          user_id: metadata.userId,
          device_type: metadata.deviceType,
          timestamp: metadata.timestamp.toISOString(),
          referrer: metadata.referrer,
        }),
      })

      if (!response.ok) {
        console.error('[AdvertisementApi] Failed to track click:', response.statusText)
        return false
      }

      return true
    } catch (error) {
      console.error('[AdvertisementApi] Error tracking click:', error)
      return false
    }
  }

  /**
   * Get user's ad profile
   */
  async getUserAdProfile(userId: string): Promise<{
    adsShownToday: number
    adsShownThisHour: number
    isPremium: boolean
    premiumUntil?: Date
  } | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/v1/ads/user-profile/${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        console.error('[AdvertisementApi] Failed to fetch user profile:', response.statusText)
        return null
      }

      const data: ApiUserAdProfileResponse = await response.json()

      return {
        adsShownToday: data.ads_shown_today,
        adsShownThisHour: data.ads_shown_this_hour,
        isPremium: data.is_premium,
        premiumUntil: data.premium_until ? new Date(data.premium_until) : undefined,
      }
    } catch (error) {
      console.error('[AdvertisementApi] Error fetching user profile:', error)
      return null
    }
  }
}

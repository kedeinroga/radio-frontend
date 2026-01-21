/**
 * Fetch Ad For Placement Use Case
 * 
 * Business logic for fetching an appropriate advertisement for a given placement.
 * Handles frequency capping, premium user checks, and ad eligibility.
 */

import type {
  IAdvertisementRepository,
  AdContext,
  FetchAdResult,
} from '../../../domain/repositories/IAdvertisementRepository'
import type { AdPlacement } from '../../../domain/valueObjects/AdPlacement'
import {
  canShowAdInPlacement,
  getNextAvailableAdTime,
} from '../../../domain/valueObjects/AdPlacement'

export interface FetchAdForPlacementInput {
  placement: AdPlacement
  context: AdContext
  /** Session ID for frequency capping */
  sessionId: string
  /** Last ad shown timestamp for this placement */
  lastAdTimestamp?: Date
  /** Number of impressions shown in this session for this placement */
  sessionImpressions: number
}

export interface FetchAdForPlacementOutput {
  ad: FetchAdResult
  /** Whether frequency cap was applied */
  frequencyCapped: boolean
  /** Time until next ad can be shown (if capped) */
  nextAvailableTime?: Date
}

export class FetchAdForPlacement {
  constructor(private adRepository: IAdvertisementRepository) {}

  async execute(input: FetchAdForPlacementInput): Promise<FetchAdForPlacementOutput> {
    // Check if user is premium (no ads for premium users)
    if (input.context.isPremium) {
      return {
        ad: { ad: null, reason: 'premium_user' },
        frequencyCapped: false,
      }
    }

    // Check frequency capping for this placement
    const canShow = canShowAdInPlacement(
      input.placement,
      input.lastAdTimestamp || null,
      input.sessionImpressions
    )

    if (!canShow) {
      const nextAvailableTime = getNextAvailableAdTime(
        input.placement,
        input.lastAdTimestamp || null
      )
      
      return {
        ad: { ad: null, reason: 'frequency_cap_reached' },
        frequencyCapped: true,
        nextAvailableTime,
      }
    }

    // If user is authenticated, check daily/hourly limits
    if (input.context.userId) {
      const userProfile = await this.adRepository.getUserAdProfile(input.context.userId)
      
      if (userProfile) {
        // Premium users don't see ads
        if (userProfile.isPremium) {
          return {
            ad: { ad: null, reason: 'premium_user' },
            frequencyCapped: false,
          }
        }

        // Check hourly limit (10 ads/hour default)
        if (userProfile.adsShownThisHour >= 10) {
          return {
            ad: { ad: null, reason: 'frequency_cap_reached' },
            frequencyCapped: true,
          }
        }

        // Check daily limit (50 ads/day default)
        if (userProfile.adsShownToday >= 50) {
          return {
            ad: { ad: null, reason: 'frequency_cap_reached' },
            frequencyCapped: true,
          }
        }
      }
    }

    // Fetch ad from repository (already sanitized in repository layer)
    const adResult = await this.adRepository.fetchAdForPlacement(
      input.placement,
      input.context
    )

    return {
      ad: adResult,
      frequencyCapped: false,
    }
  }
}

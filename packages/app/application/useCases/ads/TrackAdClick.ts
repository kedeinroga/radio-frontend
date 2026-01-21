/**
 * Track Ad Click Use Case
 * 
 * Records an ad click with analytics.
 * Integrates fraud detection to prevent click fraud.
 * Must be called with CSRF protection when tracking from client.
 */

import type {
  IAdvertisementRepository,
  ClickMetadata,
} from '../../../domain/repositories/IAdvertisementRepository'
import { getFraudDetectionService } from '../../../infrastructure/ads/FraudDetection'

export interface TrackClickInput {
  adId: string
  metadata: ClickMetadata
  /** User-Agent header for fraud detection */
  userAgent?: string
}

export interface TrackClickOutput {
  /** Whether tracking was successful */
  success: boolean
  /** Fraud detection result */
  fraudDetection?: {
    riskScore: number
    flags: string[]
  }
  /** Error message if tracking failed */
  error?: string
}

export class TrackAdClick {
  constructor(private adRepository: IAdvertisementRepository) {}

  async execute(input: TrackClickInput): Promise<TrackClickOutput> {
    try {
      // Validate that impressionId is provided (clicks must be linked to impressions)
      if (!input.metadata.impressionId) {
        return {
          success: false,
          error: 'Impression ID is required for click tracking',
        }
      }

      // **FRAUD DETECTION: Validate click before tracking**
      const fraudService = getFraudDetectionService()
      const fraudCheck = fraudService.validateClick(input.adId, input.metadata, input.userAgent)

      // Block if fraud score is too high
      if (!fraudCheck.isValid) {
        console.warn('[TrackAdClick] Blocked fraudulent click:', {
          adId: input.adId,
          impressionId: input.metadata.impressionId,
          riskScore: fraudCheck.riskScore,
          flags: fraudCheck.flags,
          reason: fraudCheck.reason,
        })

        return {
          success: false,
          error: fraudCheck.reason || 'Fraudulent activity detected',
          fraudDetection: {
            riskScore: fraudCheck.riskScore,
            flags: fraudCheck.flags,
          },
        }
      }

      // Track click in API
      const success = await this.adRepository.trackClick(
        input.adId,
        input.metadata
      )

      if (!success) {
        return {
          success: false,
          error: 'Failed to track click in API',
        }
      }

      // **FRAUD DETECTION: Record successful click**
      fraudService.recordClick(input.adId, input.metadata)

      return {
        success: true,
        fraudDetection: {
          riskScore: fraudCheck.riskScore,
          flags: fraudCheck.flags,
        },
      }
    } catch (error) {
      console.error('[TrackAdClick] Error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

/**
 * Track Ad Impression Use Case
 * 
 * Records an ad impression with analytics and updates frequency capping counters.
 * Integrates fraud detection to prevent invalid impressions.
 * Must be called with CSRF protection when tracking from client.
 */

import type {
  IAdvertisementRepository,
  ImpressionMetadata,
} from '../../../domain/repositories/IAdvertisementRepository'
import { getFraudDetectionService } from '../../../infrastructure/ads/FraudDetection'

export interface TrackImpressionInput {
  adId: string
  metadata: ImpressionMetadata
  /** User-Agent header for fraud detection */
  userAgent?: string
}

export interface TrackImpressionOutput {
  /** Impression ID for subsequent click tracking */
  impressionId: string
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

export class TrackAdImpression {
  constructor(private adRepository: IAdvertisementRepository) {}

  async execute(input: TrackImpressionInput): Promise<TrackImpressionOutput> {
    try {
      // **FRAUD DETECTION: Validate impression before tracking**
      const fraudService = getFraudDetectionService()
      const fraudCheck = fraudService.validateImpression(input.adId, input.metadata, input.userAgent)

      // Block if fraud score is too high
      if (!fraudCheck.isValid) {

        return {
          impressionId: '',
          success: false,
          error: fraudCheck.reason || 'Fraudulent activity detected',
          fraudDetection: {
            riskScore: fraudCheck.riskScore,
            flags: fraudCheck.flags,
          },
        }
      }

      // Track impression in API
      const impressionId = await this.adRepository.trackImpression(
        input.adId,
        input.metadata
      )

      // If no impression ID returned, tracking failed
      if (!impressionId) {
        return {
          impressionId: '',
          success: false,
          error: 'Failed to track impression in API',
        }
      }

      // **FRAUD DETECTION: Record successful impression**
      fraudService.recordImpression(input.adId, input.metadata, input.userAgent)

      return {
        impressionId,
        success: true,
        fraudDetection: {
          riskScore: fraudCheck.riskScore,
          flags: fraudCheck.flags,
        },
      }
    } catch (error) {

      return {
        impressionId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }
}

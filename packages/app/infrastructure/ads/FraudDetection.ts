/**
 * Ad Fraud Detection Service
 * 
 * Detects and prevents fraudulent ad impressions and clicks.
 * Implements multiple fraud detection techniques:
 * - Rate limiting
 * - Duplicate detection
 * - User-Agent validation
 * - CTR anomaly detection
 * - Session fingerprinting
 */

import { ImpressionCache, getImpressionCache } from './ImpressionCache'
import type { ImpressionMetadata, ClickMetadata } from '../../domain/repositories/IAdvertisementRepository'

/**
 * Fraud validation result
 */
export interface FraudValidationResult {
  isValid: boolean
  reason?: string
  riskScore: number // 0-100, higher = more suspicious
  flags: string[] // List of fraud indicators
}

/**
 * Fraud detection configuration
 */
export interface FraudDetectionConfig {
  // Rate limits
  maxImpressionsPerSession: number // Default: 100
  maxImpressionsPerMinute: number // Default: 20
  maxClicksPerSession: number // Default: 50
  maxClicksPerMinute: number // Default: 10

  // CTR thresholds
  maxCTR: number // Default: 0.5 (50%)
  minTimeBetweenClicks: number // Default: 1000ms

  // Duplicate detection
  duplicateWindowMs: number // Default: 1000ms

  // Risk score thresholds
  blockThreshold: number // Default: 80 (block if >= 80)
  warningThreshold: number // Default: 50 (flag if >= 50)
}

const DEFAULT_CONFIG: FraudDetectionConfig = {
  maxImpressionsPerSession: 100,
  maxImpressionsPerMinute: 20,
  maxClicksPerSession: 50,
  maxClicksPerMinute: 10,
  maxCTR: 0.5,
  minTimeBetweenClicks: 1000,
  duplicateWindowMs: 1000,
  blockThreshold: 80,
  warningThreshold: 50,
}

/**
 * Suspicious User-Agent patterns (bots, scrapers)
 */
const SUSPICIOUS_USER_AGENTS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python/i,
  /java/i,
  /php/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /puppeteer/i,
]

export class FraudDetectionService {
  private cache: ImpressionCache
  private config: FraudDetectionConfig

  constructor(config?: Partial<FraudDetectionConfig>) {
    this.cache = getImpressionCache()
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Validate an ad impression before tracking
   */
  validateImpression(
    adId: string,
    metadata: ImpressionMetadata,
    userAgent?: string
  ): FraudValidationResult {
    const flags: string[] = []
    let riskScore = 0

    // 1. Check for duplicate impression (same ad, same session, within threshold)
    if (
      this.cache.hasDuplicateImpression(
        adId,
        metadata.sessionId,
        this.config.duplicateWindowMs
      )
    ) {
      flags.push('duplicate_impression')
      riskScore += 40
    }

    // 2. Check session impression rate (per minute)
    const recentImpressions = this.cache.getSessionImpressions(
      metadata.sessionId,
      60 * 1000 // 1 minute
    )

    if (recentImpressions.length >= this.config.maxImpressionsPerMinute) {
      flags.push('excessive_impression_rate')
      riskScore += 30
    }

    // 3. Check total session impressions
    const totalImpressions = this.cache.getSessionImpressionCount(metadata.sessionId)

    if (totalImpressions >= this.config.maxImpressionsPerSession) {
      flags.push('session_impression_limit_exceeded')
      riskScore += 20
    }

    // 4. Check User-Agent for bot patterns
    if (userAgent && this.isSuspiciousUserAgent(userAgent)) {
      flags.push('suspicious_user_agent')
      riskScore += 50
    }

    // 5. Check if User-Agent is missing (suspicious)
    if (!userAgent || userAgent.trim() === '') {
      flags.push('missing_user_agent')
      riskScore += 25
    }

    // 6. Check timestamp validity (not in the future)
    const now = Date.now()
    const impressionTime = metadata.timestamp.getTime()

    if (impressionTime > now + 5000) {
      // 5 seconds tolerance
      flags.push('invalid_timestamp')
      riskScore += 40
    }

    // 7. Check if timestamp is too old (replay attack)
    if (now - impressionTime > 60 * 1000) {
      // More than 1 minute old
      flags.push('old_timestamp')
      riskScore += 20
    }

    // Determine validity based on risk score
    const isValid = riskScore < this.config.blockThreshold

    return {
      isValid,
      reason: !isValid ? this.getBlockReason(flags) : undefined,
      riskScore,
      flags,
    }
  }

  /**
   * Validate an ad click before tracking
   */
  validateClick(
    _adId: string, // Kept for interface consistency
    metadata: ClickMetadata,
    userAgent?: string
  ): FraudValidationResult {
    const flags: string[] = []
    let riskScore = 0

    // 1. Check for duplicate click (same impression, same session, within threshold)
    if (
      this.cache.hasDuplicateClick(
        metadata.impressionId,
        metadata.impressionId, // Use impressionId as session identifier
        this.config.duplicateWindowMs
      )
    ) {
      flags.push('duplicate_click')
      riskScore += 50
    }

    // 2. Check session click rate (per minute)
    const recentClicks = this.cache.getSessionClicks(
      metadata.impressionId, // Use impressionId as session identifier
      60 * 1000 // 1 minute
    )

    if (recentClicks.length >= this.config.maxClicksPerMinute) {
      flags.push('excessive_click_rate')
      riskScore += 40
    }

    // 3. Check if clicks are too fast (bot-like behavior)
    if (recentClicks.length > 1) {
      const lastClick = recentClicks[recentClicks.length - 1]
      const timeSinceLastClick = metadata.timestamp.getTime() - lastClick.timestamp.getTime()

      if (timeSinceLastClick < this.config.minTimeBetweenClicks) {
        flags.push('clicks_too_fast')
        riskScore += 35
      }
    }

    // 4. Check User-Agent for bot patterns
    if (userAgent && this.isSuspiciousUserAgent(userAgent)) {
      flags.push('suspicious_user_agent')
      riskScore += 50
    }

    // 5. Check timestamp validity
    const now = Date.now()
    const clickTime = metadata.timestamp.getTime()

    if (clickTime > now + 5000) {
      flags.push('invalid_timestamp')
      riskScore += 40
    }

    if (now - clickTime > 60 * 1000) {
      flags.push('old_timestamp')
      riskScore += 20
    }

    // 6. Check CTR for session (if abnormally high, suspicious)
    const sessionCTR = this.cache.getSessionCTR(
      metadata.impressionId, // Use impressionId as session identifier
      60 * 60 * 1000 // 1 hour window
    )

    if (sessionCTR > this.config.maxCTR) {
      flags.push('abnormal_ctr')
      riskScore += 30
    }

    // Determine validity based on risk score
    const isValid = riskScore < this.config.blockThreshold

    return {
      isValid,
      reason: !isValid ? this.getBlockReason(flags) : undefined,
      riskScore,
      flags,
    }
  }

  /**
   * Check if User-Agent matches suspicious patterns
   */
  private isSuspiciousUserAgent(userAgent: string): boolean {
    return SUSPICIOUS_USER_AGENTS.some((pattern) => pattern.test(userAgent))
  }

  /**
   * Get human-readable block reason from flags
   */
  private getBlockReason(flags: string[]): string {
    if (flags.includes('duplicate_impression') || flags.includes('duplicate_click')) {
      return 'Duplicate request detected'
    }

    if (flags.includes('excessive_impression_rate') || flags.includes('excessive_click_rate')) {
      return 'Rate limit exceeded'
    }

    if (flags.includes('suspicious_user_agent')) {
      return 'Suspicious traffic source'
    }

    if (flags.includes('clicks_too_fast')) {
      return 'Bot-like behavior detected'
    }

    if (flags.includes('abnormal_ctr')) {
      return 'Abnormal click pattern detected'
    }

    return 'Fraudulent activity detected'
  }

  /**
   * Record impression after validation
   */
  recordImpression(
    adId: string,
    metadata: ImpressionMetadata,
    userAgent?: string
  ): void {
    this.cache.addImpression({
      adId,
      userId: metadata.userId,
      sessionId: metadata.sessionId,
      userAgent,
      timestamp: metadata.timestamp,
      placement: metadata.placement,
    })
  }

  /**
   * Record click after validation
   */
  recordClick(adId: string, metadata: ClickMetadata): void {
    this.cache.addClick({
      adId,
      impressionId: metadata.impressionId,
      userId: metadata.userId,
      sessionId: metadata.impressionId, // Use impressionId as session identifier
      timestamp: metadata.timestamp,
    })
  }

  /**
   * Get fraud detection statistics
   */
  getStats(): {
    cacheStats: ReturnType<ImpressionCache['getStats']>
    config: FraudDetectionConfig
  } {
    return {
      cacheStats: this.cache.getStats(),
      config: this.config,
    }
  }

  /**
   * Clear fraud detection cache (for testing)
   */
  clearCache(): void {
    this.cache.clear()
  }
}

// Singleton instance
let fraudDetectionInstance: FraudDetectionService | null = null

export function getFraudDetectionService(
  config?: Partial<FraudDetectionConfig>
): FraudDetectionService {
  if (!fraudDetectionInstance) {
    fraudDetectionInstance = new FraudDetectionService(config)
  }
  return fraudDetectionInstance
}

export function resetFraudDetectionService(): void {
  if (fraudDetectionInstance) {
    fraudDetectionInstance.clearCache()
    fraudDetectionInstance = null
  }
}

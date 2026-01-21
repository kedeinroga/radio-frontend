/**
 * Impression Cache for Ad Fraud Detection
 * 
 * Tracks recent impressions and clicks to detect suspicious patterns.
 * Uses in-memory cache with TTL to prevent memory leaks.
 */

export interface CachedImpression {
  adId: string
  userId?: string
  sessionId: string
  ipAddress?: string
  userAgent?: string
  timestamp: Date
  placement: string
}

export interface CachedClick {
  adId: string
  impressionId: string
  userId?: string
  sessionId: string
  timestamp: Date
}

/**
 * In-memory cache with TTL for impressions and clicks
 */
export class ImpressionCache {
  private impressions: Map<string, CachedImpression> = new Map()
  private clicks: Map<string, CachedClick> = new Map()
  private userImpressionCounts: Map<string, number> = new Map()
  private sessionImpressionCounts: Map<string, number> = new Map()
  
  // Cleanup interval (5 minutes)
  private cleanupInterval: NodeJS.Timeout | null = null
  
  // TTL for cached data (1 hour)
  private readonly CACHE_TTL_MS = 60 * 60 * 1000

  constructor() {
    // Start cleanup interval
    this.startCleanup()
  }

  /**
   * Add an impression to the cache
   */
  addImpression(impression: CachedImpression): void {
    const key = `${impression.adId}-${impression.sessionId}-${impression.timestamp.getTime()}`
    this.impressions.set(key, impression)

    // Increment counters
    if (impression.userId) {
      const userCount = this.userImpressionCounts.get(impression.userId) || 0
      this.userImpressionCounts.set(impression.userId, userCount + 1)
    }

    const sessionCount = this.sessionImpressionCounts.get(impression.sessionId) || 0
    this.sessionImpressionCounts.set(impression.sessionId, sessionCount + 1)
  }

  /**
   * Add a click to the cache
   */
  addClick(click: CachedClick): void {
    const key = `${click.adId}-${click.impressionId}-${click.timestamp.getTime()}`
    this.clicks.set(key, click)
  }

  /**
   * Get impressions for a specific session in time window
   */
  getSessionImpressions(sessionId: string, timeWindowMs: number): CachedImpression[] {
    const now = Date.now()
    const cutoff = now - timeWindowMs

    return Array.from(this.impressions.values()).filter(
      (imp) =>
        imp.sessionId === sessionId &&
        imp.timestamp.getTime() >= cutoff
    )
  }

  /**
   * Get impressions for a specific user in time window
   */
  getUserImpressions(userId: string, timeWindowMs: number): CachedImpression[] {
    const now = Date.now()
    const cutoff = now - timeWindowMs

    return Array.from(this.impressions.values()).filter(
      (imp) =>
        imp.userId === userId &&
        imp.timestamp.getTime() >= cutoff
    )
  }

  /**
   * Get clicks for a specific session in time window
   */
  getSessionClicks(sessionId: string, timeWindowMs: number): CachedClick[] {
    const now = Date.now()
    const cutoff = now - timeWindowMs

    return Array.from(this.clicks.values()).filter(
      (click) =>
        click.sessionId === sessionId &&
        click.timestamp.getTime() >= cutoff
    )
  }

  /**
   * Check if impression was recently recorded (duplicate detection)
   */
  hasDuplicateImpression(
    adId: string,
    sessionId: string,
    thresholdMs: number = 1000
  ): boolean {
    const now = Date.now()
    const cutoff = now - thresholdMs

    return Array.from(this.impressions.values()).some(
      (imp) =>
        imp.adId === adId &&
        imp.sessionId === sessionId &&
        imp.timestamp.getTime() >= cutoff
    )
  }

  /**
   * Check if click was recently recorded (duplicate detection)
   */
  hasDuplicateClick(
    impressionId: string,
    sessionId: string,
    thresholdMs: number = 1000
  ): boolean {
    const now = Date.now()
    const cutoff = now - thresholdMs

    return Array.from(this.clicks.values()).some(
      (click) =>
        click.impressionId === impressionId &&
        click.sessionId === sessionId &&
        click.timestamp.getTime() >= cutoff
    )
  }

  /**
   * Get impression count for session
   */
  getSessionImpressionCount(sessionId: string): number {
    return this.sessionImpressionCounts.get(sessionId) || 0
  }

  /**
   * Get impression count for user
   */
  getUserImpressionCount(userId: string): number {
    return this.userImpressionCounts.get(userId) || 0
  }

  /**
   * Calculate click-through rate for a session
   */
  getSessionCTR(sessionId: string, timeWindowMs: number): number {
    const impressions = this.getSessionImpressions(sessionId, timeWindowMs)
    const clicks = this.getSessionClicks(sessionId, timeWindowMs)

    if (impressions.length === 0) return 0

    return clicks.length / impressions.length
  }

  /**
   * Clean up old entries
   */
  private cleanup(): void {
    const now = Date.now()
    const cutoff = now - this.CACHE_TTL_MS

    // Clean impressions
    for (const [key, impression] of this.impressions.entries()) {
      if (impression.timestamp.getTime() < cutoff) {
        this.impressions.delete(key)

        // Update counters
        if (impression.userId) {
          const count = this.userImpressionCounts.get(impression.userId) || 0
          if (count <= 1) {
            this.userImpressionCounts.delete(impression.userId)
          } else {
            this.userImpressionCounts.set(impression.userId, count - 1)
          }
        }

        const sessionCount = this.sessionImpressionCounts.get(impression.sessionId) || 0
        if (sessionCount <= 1) {
          this.sessionImpressionCounts.delete(impression.sessionId)
        } else {
          this.sessionImpressionCounts.set(impression.sessionId, sessionCount - 1)
        }
      }
    }

    // Clean clicks
    for (const [key, click] of this.clicks.entries()) {
      if (click.timestamp.getTime() < cutoff) {
        this.clicks.delete(key)
      }
    }
  }

  /**
   * Start periodic cleanup
   */
  private startCleanup(): void {
    // Clean every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Stop cleanup and clear cache (for testing/shutdown)
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.impressions.clear()
    this.clicks.clear()
    this.userImpressionCounts.clear()
    this.sessionImpressionCounts.clear()
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    impressionCount: number
    clickCount: number
    uniqueUsers: number
    uniqueSessions: number
  } {
    return {
      impressionCount: this.impressions.size,
      clickCount: this.clicks.size,
      uniqueUsers: this.userImpressionCounts.size,
      uniqueSessions: this.sessionImpressionCounts.size,
    }
  }
}

// Singleton instance
let cacheInstance: ImpressionCache | null = null

export function getImpressionCache(): ImpressionCache {
  if (!cacheInstance) {
    cacheInstance = new ImpressionCache()
  }
  return cacheInstance
}

export function resetImpressionCache(): void {
  if (cacheInstance) {
    cacheInstance.destroy()
    cacheInstance = null
  }
}

import { useState, useCallback, useEffect } from 'react'

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs: number
}

interface RateLimitState {
  attempts: number
  isBlocked: boolean
  blockUntil: number | null
  remainingAttempts: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 15 * 60 * 1000, // 15 minutes block
}

/**
 * Rate Limiting Hook
 * Implements client-side rate limiting for login attempts
 * 
 * @param key - Unique key for this rate limiter (e.g., 'login', 'register')
 * @param config - Configuration for rate limiting
 * @returns Rate limit state and control functions
 */
export function useRateLimit(
  key: string,
  config: Partial<RateLimitConfig> = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const storageKey = `rate-limit:${key}`

  const [state, setState] = useState<RateLimitState>(() => {
    if (typeof window === 'undefined') {
      return {
        attempts: 0,
        isBlocked: false,
        blockUntil: null,
        remainingAttempts: finalConfig.maxAttempts,
      }
    }

    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        const now = Date.now()

        // Check if block has expired
        if (parsed.blockUntil && parsed.blockUntil > now) {
          return {
            attempts: parsed.attempts || 0,
            isBlocked: true,
            blockUntil: parsed.blockUntil,
            remainingAttempts: 0,
          }
        }

        // Check if window has expired
        if (parsed.windowStart && now - parsed.windowStart > finalConfig.windowMs) {
          // Reset attempts
          return {
            attempts: 0,
            isBlocked: false,
            blockUntil: null,
            remainingAttempts: finalConfig.maxAttempts,
          }
        }

        return {
          attempts: parsed.attempts || 0,
          isBlocked: false,
          blockUntil: null,
          remainingAttempts: Math.max(0, finalConfig.maxAttempts - (parsed.attempts || 0)),
        }
      }
    } catch (error) {
      // Silent fail
    }

    return {
      attempts: 0,
      isBlocked: false,
      blockUntil: null,
      remainingAttempts: finalConfig.maxAttempts,
    }
  })

  // Update localStorage when state changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const now = Date.now()
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          attempts: state.attempts,
          blockUntil: state.blockUntil,
          windowStart: now,
        })
      )
    } catch (error) {
      // Silent fail
    }
  }, [state, storageKey])

  // Check block status periodically
  useEffect(() => {
    if (!state.blockUntil) return

    const checkInterval = setInterval(() => {
      const now = Date.now()
      if (state.blockUntil && state.blockUntil <= now) {
        // Block expired, reset
        setState({
          attempts: 0,
          isBlocked: false,
          blockUntil: null,
          remainingAttempts: finalConfig.maxAttempts,
        })
      }
    }, 1000) // Check every second

    return () => clearInterval(checkInterval)
  }, [state.blockUntil, finalConfig.maxAttempts])

  /**
   * Record a failed attempt
   * Returns true if now blocked
   */
  const recordAttempt = useCallback(() => {
    if (state.isBlocked) return true

    const newAttempts = state.attempts + 1

    if (newAttempts >= finalConfig.maxAttempts) {
      // Block user
      const blockUntil = Date.now() + finalConfig.blockDurationMs
      setState({
        attempts: newAttempts,
        isBlocked: true,
        blockUntil,
        remainingAttempts: 0,
      })
      return true
    }

    // Increment attempts
    setState({
      attempts: newAttempts,
      isBlocked: false,
      blockUntil: null,
      remainingAttempts: finalConfig.maxAttempts - newAttempts,
    })

    return false
  }, [state, finalConfig])

  /**
   * Reset rate limit (call on successful action)
   */
  const reset = useCallback(() => {
    setState({
      attempts: 0,
      isBlocked: false,
      blockUntil: null,
      remainingAttempts: finalConfig.maxAttempts,
    })

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey)
      } catch (error) {
        // Silent fail
      }
    }
  }, [storageKey, finalConfig.maxAttempts])

  /**
   * Get remaining time in seconds until unblocked
   */
  const getRemainingBlockTime = useCallback((): number => {
    if (!state.blockUntil) return 0
    const remaining = Math.max(0, state.blockUntil - Date.now())
    return Math.ceil(remaining / 1000)
  }, [state.blockUntil])

  /**
   * Get formatted time string
   */
  const getFormattedBlockTime = useCallback((): string => {
    const seconds = getRemainingBlockTime()
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${seconds}s`
  }, [getRemainingBlockTime])

  return {
    ...state,
    recordAttempt,
    reset,
    getRemainingBlockTime,
    getFormattedBlockTime,
  }
}

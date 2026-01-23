'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useAuthStore } from '@radio-app/app'
import { SessionValidator } from '../../../packages/app/infrastructure/auth/SessionValidator'
import { isTokenExpired, willExpireSoon, getTimeUntilExpiration } from '../../../packages/app/infrastructure/utils/jwtHelpers'
import { WebSecureStorage } from '@radio-app/app'

const storage = new WebSecureStorage()

/**
 * Hook for automatic session validation and management
 * 
 * Features:
 * - Validates token on mount
 * - Auto-refreshes before expiration
 * - Validates device fingerprint
 * - Detects session hijacking
 * - Logs security events
 * 
 * @param options Configuration options
 */
export function useSessionValidation(options?: {
  validateOnMount?: boolean
  autoRefresh?: boolean
  refreshBeforeMinutes?: number
  validateInterval?: number // minutes
}) {
  const {
    validateOnMount = true,
    autoRefresh = true,
    refreshBeforeMinutes = 5,
    validateInterval = 15, // Validate every 15 minutes
  } = options || {}

  const { logout, isAuthenticated } = useAuthStore()
  const validationTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  /**
   * Validates the current session with the backend
   */
  const validateSession = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) {
      return false
    }

    try {
      const token = await storage.getItem('access_token')
      if (!token) {
        logout()
        return false
      }

      // Check if token is expired locally first
      if (isTokenExpired(token)) {
        logout()
        return false
      }

      // Validate device fingerprint
      if (!SessionValidator.validateDeviceFingerprint()) {
        logout()
        return false
      }

      // Validate with backend
      const result = await SessionValidator.validateToken(token, true)
      
      if (!result.valid) {
        logout()
        return false
      }

      return true
    } catch (error) {
      return false
    }
  }, [isAuthenticated, logout])

  /**
   * Attempts to refresh the access token
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = await storage.getItem('refresh_token')
      if (!refreshToken) {
        return false
      }

      // Call your refresh endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!response.ok) {
        logout()
        return false
      }

      const data = await response.json()
      
      // Store new tokens
      await storage.setItem('access_token', data.access_token)
      return true
    } catch (error) {
      logout()
      return false
    }
  }, [logout])

  /**
   * Sets up auto-refresh timer
   */
  const setupAutoRefresh = useCallback(async () => {
    if (!autoRefresh || !isAuthenticated) {
      return
    }

    const token = await storage.getItem('access_token')
    if (!token) {
      return
    }

    const timeUntilExpiration = getTimeUntilExpiration(token)
    if (timeUntilExpiration === null) {
      return
    }

    // Calculate when to refresh (refreshBeforeMinutes before expiration)
    const refreshThreshold = refreshBeforeMinutes * 60 * 1000
    const refreshIn = timeUntilExpiration - refreshThreshold

    if (refreshIn > 0) {
      // Schedule refresh
      refreshTimerRef.current = setTimeout(async () => {
        const success = await refreshToken()
        
        if (success) {
          // Set up next refresh
          setupAutoRefresh()
        }
      }, refreshIn)
    } else {
      // Token will expire soon, refresh immediately
      await refreshToken()
      setupAutoRefresh()
    }
  }, [autoRefresh, isAuthenticated, refreshBeforeMinutes, refreshToken])

  /**
   * Sets up periodic validation
   */
  const setupPeriodicValidation = useCallback(() => {
    if (!isAuthenticated || validateInterval <= 0) {
      return
    }

    // Validate periodically
    validationTimerRef.current = setInterval(async () => {
      await validateSession()
    }, validateInterval * 60 * 1000)
  }, [isAuthenticated, validateInterval, validateSession])

  /**
   * Initialize session validation
   */
  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    // Store device fingerprint on first load
    SessionValidator.storeDeviceFingerprint()

    // Validate on mount if enabled
    if (validateOnMount) {
      validateSession()
    }

    // Setup auto-refresh
    setupAutoRefresh()

    // Setup periodic validation
    setupPeriodicValidation()

    // Cleanup timers on unmount
    return () => {
      if (validationTimerRef.current) {
        clearInterval(validationTimerRef.current)
      }
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
    }
  }, [isAuthenticated, validateOnMount, validateSession, setupAutoRefresh, setupPeriodicValidation])

  /**
   * Check if token will expire soon
   */
  const checkTokenExpiration = useCallback(async (): Promise<boolean> => {
    const token = await storage.getItem('access_token')
    if (!token) {
      return false
    }

    return willExpireSoon(token, refreshBeforeMinutes)
  }, [refreshBeforeMinutes])

  return {
    validateSession,
    refreshToken,
    checkTokenExpiration,
  }
}

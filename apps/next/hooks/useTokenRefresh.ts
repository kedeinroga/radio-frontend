/**
 * Token Refresh Hook
 * 
 * Automatically refreshes access tokens before they expire
 * Backend tokens expire in 15 minutes, so we refresh every 10 minutes
 * to ensure uninterrupted user experience
 */

'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@radio-app/app'

const REFRESH_INTERVAL = 10 * 60 * 1000 // 10 minutes in milliseconds

interface UseTokenRefreshOptions {
  /**
   * Interval in milliseconds to refresh tokens
   * Default: 10 minutes
   */
  refreshInterval?: number
  
  /**
   * Whether to refresh immediately on mount
   * Default: false
   */
  refreshOnMount?: boolean
  
  /**
   * Callback when refresh succeeds
   */
  onRefreshSuccess?: () => void
  
  /**
   * Callback when refresh fails
   */
  onRefreshError?: (error: Error) => void
}

export function useTokenRefresh(options: UseTokenRefreshOptions = {}) {
  const {
    refreshInterval = REFRESH_INTERVAL,
    refreshOnMount = false,
    onRefreshSuccess,
    onRefreshError,
  } = options

  const router = useRouter()
  const pathname = usePathname()
  const { setUser } = useAuthStore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isRefreshingRef = useRef(false)

  /**
   * Refresh the access token using the refresh_token cookie
   */
  const refreshToken = useCallback(async () => {
    // Prevent concurrent refresh attempts
    if (isRefreshingRef.current) {
      return { success: false, reason: 'already_refreshing' }
    }

    isRefreshingRef.current = true

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          error: 'Failed to refresh token' 
        }))
        
        throw new Error(error.error?.message || 'Token refresh failed')
      }

      const data = await response.json()

      // Refresh successful
      onRefreshSuccess?.()

      return { 
        success: true, 
        expiresIn: data.expires_in,
        jti: data.jti,
      }
    } catch (error: any) {
      // Clear user state
      setUser(null)

      // Call error callback
      onRefreshError?.(error)

      // Redirect to login
      const locale = pathname?.split('/')[1] || 'es'
      router.push(`/${locale}/admin/login`)

      return { success: false, reason: error.message }
    } finally {
      isRefreshingRef.current = false
    }
  }, [router, pathname, setUser, onRefreshSuccess, onRefreshError])

  /**
   * Start automatic token refresh
   */
  const startAutoRefresh = useCallback(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      refreshToken()
    }, refreshInterval)
  }, [refreshToken, refreshInterval])

  /**
   * Stop automatic token refresh
   */
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Set up automatic refresh on mount
  useEffect(() => {
    // Refresh immediately if requested
    if (refreshOnMount) {
      refreshToken()
    }

    // Start automatic refresh
    startAutoRefresh()

    // Clean up on unmount
    return () => {
      stopAutoRefresh()
    }
  }, [refreshOnMount, refreshToken, startAutoRefresh, stopAutoRefresh])

  // Pause refresh when tab is not visible to save resources
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAutoRefresh()
      } else {
        // Refresh immediately when tab becomes visible
        refreshToken()
        startAutoRefresh()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refreshToken, startAutoRefresh, stopAutoRefresh])

  return {
    refreshToken,
    startAutoRefresh,
    stopAutoRefresh,
    isRefreshing: isRefreshingRef.current,
  }
}

'use client'

import { useEffect, useRef } from 'react'
import { useAuthStore } from '@radio-app/app'
import { User } from '@radio-app/app'

// Global state to coordinate session restoration across all components
let isRestoring = false
let restorationPromise: Promise<void> | null = null

/**
 * Hook to restore user session from HttpOnly cookies on app load
 * Calls /api/auth/me to get user info if cookies exist
 * Uses global coordination to prevent duplicate restoration attempts
 */
export function useRestoreSession() {
  const { user, setUser } = useAuthStore()
  const hasAttemptedRestore = useRef(false)

  useEffect(() => {
    // Only restore if user is not already in store and haven't tried yet
    if (user || hasAttemptedRestore.current) {
      return
    }

    // Mark that we're attempting to restore
    hasAttemptedRestore.current = true

    const restoreSession = async () => {
      // If already restoring, wait for that restoration to complete
      if (isRestoring && restorationPromise) {
        await restorationPromise
        return
      }

      // Set global flag and create restoration promise
      isRestoring = true
      restorationPromise = (async () => {
        try {
          // Try to get user info from backend
          // If cookies exist, this will succeed
          const response = await fetch('/api/auth/me', {
            credentials: 'include',
            signal: AbortSignal.timeout(5000) // 5 second timeout
          })

          if (response.ok) {
            const userInfo = await response.json()
            
            // Create User entity
            const restoredUser = new User(
              userInfo.id,
              userInfo.email,
              userInfo.email.split('@')[0],
              userInfo.role as 'guest' | 'premium' | 'admin',
              undefined,
              []
            )
            
            setUser(restoredUser)
          }
        } catch (error: any) {
          // Silently fail - no need to log in production
          // Session restoration is optional
        } finally {
          // Always reset global state
          isRestoring = false
          restorationPromise = null
        }
      })()

      await restorationPromise
    }

    restoreSession()
  }, [user, setUser])
}

/**
 * Utility function to check if session restoration is in progress
 * Used by AdminGuard to avoid duplicate checks
 */
export function isSessionRestoring(): boolean {
  return isRestoring
}

/**
 * Utility function to wait for ongoing session restoration
 * Used by AdminGuard to synchronize with restoration
 */
export async function waitForSessionRestoration(): Promise<void> {
  if (isRestoring && restorationPromise) {
    await restorationPromise
  }
}

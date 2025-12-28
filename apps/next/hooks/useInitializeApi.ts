'use client'

import { useEffect } from 'react'
import { initializeApiClient } from '@radio-app/app'

/**
 * Hook to initialize the API client
 * Note: Tokens are now in HttpOnly cookies managed by API routes
 * This provides an empty storage adapter for backward compatibility
 */
export function useInitializeApi() {
  useEffect(() => {
    // Initialize API client with empty token storage
    // Tokens are in HttpOnly cookies and sent automatically with requests
    // API routes will proxy requests to backend with proper authentication
    initializeApiClient({
      getAccessToken: async () => null,
      getRefreshToken: async () => null,
      setAccessToken: async () => {},
      clearTokens: async () => {}
    })
  }, [])
}

'use client'

import { useEffect } from 'react'
import { initializeApiClient, WebSecureStorage } from '@radio-app/app'

/**
 * Hook to initialize the API client with token storage
 * Should be called once at app startup or in protected route layouts
 */
export function useInitializeApi() {
  useEffect(() => {
    const storage = new WebSecureStorage()
    
    // Create token storage adapter
    const tokenStorage = {
      getAccessToken: () => storage.getItem('access_token'),
      getRefreshToken: () => storage.getItem('refresh_token'),
      setAccessToken: (token: string) => storage.setItem('access_token', token),
      clearTokens: async () => {
        await storage.removeItem('access_token')
        await storage.removeItem('refresh_token')
      }
    }
    
    initializeApiClient(tokenStorage)
  }, [])
}

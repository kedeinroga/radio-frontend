/**
 * useAuth Hook
 * 
 * Provides authentication state and user info.
 * Simplified version - integrates with auth store.
 */

'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@radio-app/app'

interface User {
  id: string
  email: string
  name?: string
  role: 'guest' | 'premium' | 'admin'
  country?: string
  favoriteGenres?: string[]
}

export function useAuth() {
  const authStore = useAuthStore()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Get user from auth store
    if (authStore.user) {
      setUser({
        id: authStore.user.id,
        email: authStore.user.email,
        name: authStore.user.name,
        role: authStore.user.role,
      })
    } else {
      setUser(null)
    }
  }, [authStore.user])

  const isPremium = user?.role === 'premium'
  const isAdmin = user?.role === 'admin'
  const isLoggedIn = !!user && user.role !== 'guest'

  return {
    user,
    isPremium,
    isAdmin,
    isLoggedIn,
    isLoading: authStore.isLoading,
  }
}

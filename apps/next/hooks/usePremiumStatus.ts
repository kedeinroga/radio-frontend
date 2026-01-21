'use client'

/**
 * usePremiumStatus Hook
 * 
 * Hook para verificar y gestionar el estado premium del usuario.
 * Cachea el resultado para evitar llamadas repetidas a la API.
 * 
 * @example
 * ```tsx
 * const { isPremium, isLoading, subscription, plan, refresh } = usePremiumStatus()
 * 
 * if (isPremium) {
 *   return <PremiumContent />
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react'
import type { Subscription, SubscriptionPlan } from '@radio-app/app'

interface PremiumStatusState {
  isPremium: boolean
  isLoading: boolean
  subscription: Subscription | null
  plan: SubscriptionPlan | null
  isActive: boolean
  daysRemaining?: number
  error: string | null
}

export function usePremiumStatus() {
  const [state, setState] = useState<PremiumStatusState>({
    isPremium: false,
    isLoading: true,
    subscription: null,
    plan: null,
    isActive: false,
    error: null,
  })

  /**
   * Fetch subscription status from API
   */
  const fetchStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      const response = await fetch('/api/subscription/status', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for auth
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated - treat as free user
          setState({
            isPremium: false,
            isLoading: false,
            subscription: null,
            plan: null,
            isActive: false,
            error: null,
          })
          return
        }

        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      setState({
        isPremium: data.isPremium || false,
        isLoading: false,
        subscription: data.subscription,
        plan: data.plan,
        isActive: data.isActive || false,
        daysRemaining: data.daysRemaining,
        error: null,
      })

    } catch (error) {
      console.error('[usePremiumStatus] Error fetching status:', error)
      
      setState({
        isPremium: false,
        isLoading: false,
        subscription: null,
        plan: null,
        isActive: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }, [])

  /**
   * Refresh status manually
   */
  const refresh = useCallback(() => {
    fetchStatus()
  }, [fetchStatus])

  /**
   * Fetch on mount
   */
  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  return {
    ...state,
    refresh,
  }
}

/**
 * Hook simplificado que solo retorna isPremium
 * Útil cuando solo necesitas saber si el usuario es premium
 */
export function useIsPremium(): boolean {
  const { isPremium } = usePremiumStatus()
  return isPremium
}

export default usePremiumStatus

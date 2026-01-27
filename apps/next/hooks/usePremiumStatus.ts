import { useState, useEffect } from 'react'
import { useHttpClient } from './useHttpClient'
import { API_ROUTES } from '@/lib/constants/api'

/**
 * Hook para verificar el estado premium del usuario
 * 
 * ✅ Usa useHttpClient (Clean Architecture)
 * ✅ Usa API_ROUTES (no magic strings)
 * ✅ Type-safe
 */
export function usePremiumStatus() {
  const { get } = useHttpClient()
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkPremiumStatus()
  }, [])

  const checkPremiumStatus = async () => {
    try {
      setLoading(true)
      setError(null)

      // ✅ Usa hook con DI pattern
      const data = await get<{ isPremium: boolean }>(
        API_ROUTES.SUBSCRIPTION.STATUS
      )

      setIsPremium(data.isPremium)
    } catch (err: any) {
      console.error('Failed to check premium status:', err)
      setError(err.message || 'Failed to check premium status')
      setIsPremium(false)
    } finally {
      setLoading(false)
    }
  }

  const refresh = () => {
    checkPremiumStatus()
  }

  return {
    isPremium,
    loading,
    error,
    refresh,
  }
}

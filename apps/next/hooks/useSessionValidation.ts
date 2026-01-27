import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useHttpClient } from './useHttpClient'
import { API_ROUTES } from '@/lib/constants/api'

/**
 * Hook para validar la sesión del usuario
 * 
 * Verifica que el usuario esté autenticado y redirige al login si no lo está.
 * ✅ Usa useHttpClient (Clean Architecture)
 * ✅ Usa API_ROUTES (no magic strings)
 */
export function useSessionValidation(redirectTo: string = '/admin/login') {
  const { get } = useHttpClient()
  const router = useRouter()

  useEffect(() => {
    validateSession()
  }, [])

  const validateSession = async () => {
    try {
      // ✅ Intentar obtener info del usuario
      await get(API_ROUTES.AUTH.ME)
      // Si llega aquí, la sesión es válida
    } catch (error) {
      console.error('Session validation failed:', error)
      // Si falla, redirigir al login
      router.push(redirectTo)
    }
  }

  return { validateSession }
}

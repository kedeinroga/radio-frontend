'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useHttpClient } from '@/hooks/useHttpClient'
import { API_ROUTES } from '@/lib/constants/api'

interface AdminGuardProps {
  children: React.ReactNode
}

/**
 * AdminGuard Component
 * 
 * Protege rutas admin verificando que el usuario esté autenticado y sea admin.
 * ✅ Usa useHttpClient (Clean Architecture)
 * ✅ Usa API_ROUTES (no magic strings)
 * ✅ Previene loops infinitos con useRef
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { get } = useHttpClient()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const hasChecked = useRef(false) // ✅ Prevenir múltiples checks

  useEffect(() => {
    // ✅ Solo verificar una vez
    if (!hasChecked.current) {
      hasChecked.current = true
      checkAdminAuth()
    }
  }, []) // Dependencias vacías OK porque hasChecked previene re-ejecución


  const checkAdminAuth = async () => {
    try {
      setLoading(true)

      // ✅ Verificar que el usuario esté autenticado y sea admin
      const data = await get<{ user: { role: string } }>(API_ROUTES.AUTH.ME)

      if (data.user.role === 'admin') {
        setIsAuthorized(true)
      } else {
        // No es admin, redirigir
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Admin auth check failed:', error)
      // Si falla, redirigir al login
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}

export default AdminGuard

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, WebSecureStorage } from '@radio-app/app'
import { LoadingSpinner } from './LoadingSpinner'
import { useAppTranslation } from '@/hooks/useAppTranslation'

const storage = new WebSecureStorage()

/**
 * AdminGuard Component
 * Protects admin routes - redirects non-admin users
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)
  const { t } = useAppTranslation()

  useEffect(() => {
    const checkAccess = async () => {
      // Check if tokens exist in localStorage (with @radio-app: prefix)
      const accessToken = await storage.getItem('access_token')
      const refreshToken = await storage.getItem('refresh_token')
      const hasTokens = !!(accessToken && refreshToken)
      
      // Check authentication
      if (!hasTokens) {
        // Clear user if no tokens
        if (user) {
          setUser(null)
        }
        router.replace('/admin/login')
        return
      }
      
      if (!user) {
        router.replace('/admin/login')
        return
      }
      
      if (!user.isAdmin) {
        router.replace('/')
        return
      }
      
      setIsChecking(false)
    }
    
    checkAccess()
  }, [user, router, setUser])

  // Show loading while checking or redirecting
  if (isChecking || !user || !user.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner message={t('auth.verifyingAccess')} />
      </div>
    )
  }

  return <>{children}</>
}

'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore, User } from '@radio-app/app'
import { LoadingSpinner } from './LoadingSpinner'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { isSessionRestoring, waitForSessionRestoration } from '@/hooks/useRestoreSession'

/**
 * AdminGuard Component
 * Protects admin routes - redirects non-admin users
 * Also restores session from cookies if user is not in store
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, setUser } = useAuthStore()
  const [isChecking, setIsChecking] = useState(true)
  const { t } = useAppTranslation()
  const checkInProgress = useRef(false)

  useEffect(() => {
    // Avoid multiple simultaneous checks
    if (checkInProgress.current) {
      return
    }

    const checkAccess = async () => {
      checkInProgress.current = true
      
      // Extract locale from current pathname
      const locale = pathname?.split('/')[1] || 'es'
      
      try {
        // If no user in store, check if restoration is in progress
        if (!user) {
          // If restoration is happening, wait for it to complete
          if (isSessionRestoring()) {
            await waitForSessionRestoration()
            
            // After restoration completes, check if user was restored
            const currentUser = useAuthStore.getState().user
            if (currentUser) {
              // Check if restored user is admin
              if (!currentUser.isAdmin) {
                router.replace(`/${locale}`)
                return
              }
              
              // User is admin, allow access
              setIsChecking(false)
              return
            }
          }
          
          // No restoration in progress or it failed, try to restore ourselves
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
            
            // Check if restored user is admin
            if (!restoredUser.isAdmin) {
              router.replace(`/${locale}`)
              return
            }
            
            // User is admin, allow access
            setIsChecking(false)
            return
          } else {
            // No valid session
            router.replace(`/${locale}/admin/login`)
            return
          }
        }
        
        // User exists in store - verify it's still valid
        if (!user.isAdmin) {
          router.replace(`/${locale}`)
          return
        }
        
        // Verify session with backend
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          signal: AbortSignal.timeout(5000)
        })
        
        if (!response.ok) {
          setUser(null)
          router.replace(`/${locale}/admin/login`)
          return
        }
        
        setIsChecking(false)
      } catch (error: any) {
        console.error('AdminGuard - Session verification error:', error.message)
        
        // On error, redirect to login
        const locale = pathname?.split('/')[1] || 'es'
        setUser(null)
        router.replace(`/${locale}/admin/login`)
      } finally {
        checkInProgress.current = false
      }
    }
    
    checkAccess()
  }, [user, router, pathname, setUser])

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

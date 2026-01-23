'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore, User, loginSchema, validateData, sanitizeErrorMessage, SecurityLog } from '@radio-app/app'
import { useRateLimit } from '@/hooks/useRateLimit'

export default function AdminLoginPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, setUser } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  
  // Rate limiting
  const rateLimit = useRateLimit('admin-login', {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 15 * 60 * 1000, // Block for 15 minutes
  })

  // Check authentication and redirect if needed
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current user from store
        const currentUser = useAuthStore.getState().user
        
        if (currentUser?.isAdmin) {
          // User is admin - verify with backend
          try {
            const response = await fetch('/api/auth/me', {
              credentials: 'include'
            })
            
            if (response.ok) {
              // Cookies are valid, redirect to dashboard
              const locale = pathname?.split('/')[1] || 'es'
              const targetPath = `/${locale}/admin`
              router.push(targetPath)
              // Keep isCheckingAuth true while redirecting
              return
            } else {
              // Cookies invalid or expired - clear user
              useAuthStore.getState().setUser(null)
            }
          } catch (error) {

            useAuthStore.getState().setUser(null)
          }
        }
        
        // No user or session invalid - show login form
        setIsCheckingAuth(false)
      } catch (error) {

        setIsCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [router, pathname, user])

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Show redirecting spinner if user is admin
  if (user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to admin panel...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setValidationErrors({})

    // Check if user is rate limited
    if (rateLimit.isBlocked) {
      setError(`Too many failed attempts. Please wait ${rateLimit.getFormattedBlockTime()} before trying again.`)
      return
    }

    // Validate form data with Zod
    const validation = validateData(loginSchema, { email, password })
    if (!validation.success) {
      setValidationErrors(validation.errors)
      return
    }

    setIsLoggingIn(true)

    try {
      // Step 1: Login via API Route (cookies are set automatically)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(validation.data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Login failed')
      }

      const data = await response.json()
      
      // Validate response
      if (!data?.user) {
        throw new Error('Invalid response from server. Missing user information.')
      }
      
      // Step 2: Create User entity
      const loggedUser = new User(
        data.user.id,
        data.user.email,
        data.user.email.split('@')[0], // Use email prefix as name
        data.user.role as 'guest' | 'premium' | 'admin',
        undefined,
        []
      )

      // Step 3: Check if user is admin
      if (!loggedUser.isAdmin) {
        setError('Access denied. Admin privileges required.')
        
        // Log unauthorized access attempt
        SecurityLog.unauthorizedAccess('/admin', loggedUser.id)
        SecurityLog.loginFailed(validation.data.email, 'User is not an admin')
        
        // Logout to clear cookies
        await fetch('/api/auth/logout', { 
          method: 'POST',
          credentials: 'include'
        })
        
        setIsLoggingIn(false)
        
        // Record failed attempt
        rateLimit.recordAttempt()
        return
      }

      // Step 4: Log successful admin login
      SecurityLog.loginSuccess(loggedUser.id, loggedUser.email)
      SecurityLog.adminAccess(loggedUser.id, loggedUser.email, 'Admin login successful')

      // Step 5: Reset rate limit on successful login
      rateLimit.reset()

      // Step 6: Set user in store
      setUser(loggedUser)
      
      // Step 7: Redirect to admin dashboard with locale
      const locale = pathname?.split('/')[1] || 'es'
      router.push(`/${locale}/admin`)
    } catch (err: any) {
      // Sanitize error message to prevent information leakage
      const safeError = sanitizeErrorMessage(
        err,
        'Invalid email or password. Please try again.'
      )
      setError(safeError)
      setIsLoggingIn(false)
      
      // Log failed login attempt
      SecurityLog.loginFailed(email, err.message || 'Unknown error')
      
      // Record failed attempt
      const isNowBlocked = rateLimit.recordAttempt()
      if (isNowBlocked) {
        SecurityLog.rateLimitTriggered(email, rateLimit.attempts)
        setError(`Too many failed attempts. Your account has been temporarily locked for ${rateLimit.getFormattedBlockTime()}.`)
      }
    }
  }

  // Don't show login form if already admin
  if (user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-3xl">🎵</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Panel
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to access the administration dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rate Limit Warning */}
            {rateLimit.isBlocked && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-orange-600 dark:text-orange-400 text-xl">⏱️</span>
                  <div>
                    <h3 className="text-orange-800 dark:text-orange-200 font-semibold text-sm">
                      Account Temporarily Locked
                    </h3>
                    <p className="text-orange-600 dark:text-orange-300 text-sm mt-1">
                      Too many failed login attempts. Please wait {rateLimit.getFormattedBlockTime()} before trying again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-red-600 dark:text-red-400 text-xl">⚠️</span>
                  <div>
                    <h3 className="text-red-800 dark:text-red-200 font-semibold text-sm">
                      Authentication Error
                    </h3>
                    <p className="text-red-600 dark:text-red-300 text-sm mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationErrors.email 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="admin@example.com"
                disabled={isLoggingIn || rateLimit.isBlocked}
              />
              {validationErrors.email && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  validationErrors.password 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="••••••••"
                disabled={isLoggingIn || rateLimit.isBlocked}
              />
              {validationErrors.password && (
                <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn || rateLimit.isBlocked}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : rateLimit.isBlocked ? (
                <>
                  🔒 Locked - Wait {rateLimit.getFormattedBlockTime()}
                </>
              ) : (
                <>
                  🔐 Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to App Link */}
        <div className="text-center">
          <a
            href="/"
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            ← Back to Radio App
          </a>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-yellow-600 dark:text-yellow-400">🔒</span>
            <div>
              <h3 className="text-yellow-800 dark:text-yellow-200 font-semibold text-sm">
                Admin Access Only
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300 text-xs mt-1">
                This area is restricted to authorized administrators only. All login attempts are logged.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

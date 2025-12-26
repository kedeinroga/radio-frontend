'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, User, WebSecureStorage } from '@radio-app/app'
import { AuthApiRepository } from '@radio-app/app'
import { initializeApiClient } from '@radio-app/app'

const authRepo = new AuthApiRepository()
const storage = new WebSecureStorage()

export default function AdminLoginPage() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Check on mount if tokens are invalid but user exists
  useEffect(() => {
    const checkTokens = async () => {
      const accessToken = await storage.getItem('access_token')
      const refreshToken = await storage.getItem('refresh_token')
      const hasTokens = accessToken && refreshToken
      
      if (user && !hasTokens) {
        // User exists in store but no tokens - clear user
        setUser(null)
      } else if (user?.isAdmin && hasTokens) {
        // User is admin with valid tokens - redirect to dashboard
        router.push('/admin')
      }
    }
    
    checkTokens()
  }, [user, router, setUser])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoggingIn(true)

    try {
      // Step 1: Login and get tokens
      const tokens = await authRepo.login({ email, password })
      
      // Validate tokens
      if (!tokens?.access_token || !tokens?.refresh_token) {
        throw new Error('Invalid response from server. Missing authentication tokens.')
      }
      
      // Step 2: Store tokens using WebSecureStorage (with @radio-app: prefix)
      await storage.setItem('access_token', tokens.access_token)
      await storage.setItem('refresh_token', tokens.refresh_token)

      // Step 3: Initialize API client with tokens
      initializeApiClient({
        getAccessToken: () => storage.getItem('access_token'),
        getRefreshToken: () => storage.getItem('refresh_token'),
        setAccessToken: (token: string) => storage.setItem('access_token', token),
        clearTokens: async () => {
          await storage.removeItem('access_token')
          await storage.removeItem('refresh_token')
        },
      })

      // Step 4: Get user info
      const userInfo = await authRepo.getCurrentUser()
      
      // Validate user info
      if (!userInfo?.id || !userInfo?.email || !userInfo?.role) {
        throw new Error('Invalid user information received from server.')
      }
      
      // Step 5: Create User entity
      const loggedUser = new User(
        userInfo.id,
        userInfo.email,
        userInfo.email.split('@')[0], // Use email prefix as name
        userInfo.role as 'guest' | 'premium' | 'admin',
        undefined,
        []
      )

      // Step 6: Check if user is admin
      if (!loggedUser.isAdmin) {
        setError('Access denied. Admin privileges required.')
        // Clear tokens
        await storage.removeItem('access_token')
        await storage.removeItem('refresh_token')
        setIsLoggingIn(false)
        return
      }

      // Step 7: Set user in store
      setUser(loggedUser)
      
      // Step 8: Redirect to admin dashboard
      router.push('/admin')
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.')
      setIsLoggingIn(false)
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="admin@example.com"
                disabled={isLoggingIn}
              />
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
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="••••••••"
                disabled={isLoggingIn}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoggingIn}
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

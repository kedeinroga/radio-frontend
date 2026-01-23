'use client'

import { AdminGuard } from '@/components/AdminGuard'
import { useInitializeApi } from '@/hooks/useInitializeApi'
import { useTokenRefresh } from '@/hooks/useTokenRefresh'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@radio-app/app'
import { useState } from 'react'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/monitoring', label: 'Monitoring', icon: '🔍' },
  { href: '/admin/maintenance', label: 'Maintenance', icon: '⚙️' },
  { href: '/admin/translations', label: 'Translations', icon: '🌍' },
  { href: '/admin/seo', label: 'SEO', icon: '�' },
  { href: '/admin/sessions', label: 'Sessions', icon: '🔐' },
  { href: '/admin/security', label: 'Security', icon: '🛡️' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Initialize API client with token storage (must be before any early return)
  useInitializeApi()

  // Enable automatic token refresh for admin pages
  // Tokens will be refreshed every 10 minutes (they expire in 15 minutes)
  useTokenRefresh({
    refreshOnMount: false, // Don't refresh immediately, AdminGuard already validated
    onRefreshError: (error) => {

      // User will be redirected to login by the hook
    }
  })

  // Don't apply AdminGuard to login page
  // Check if the current path ends with /admin/login (ignoring locale prefix)
  if (pathname?.endsWith('/admin/login')) {
    return <>{children}</>
  }

  const handleLogout = async () => {
    // Call API Route to logout (clears HttpOnly cookies)
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {

    }
    
    // Clear user from store
    logout()
    
    // Redirect to login with locale
    const locale = pathname?.split('/')[1] || 'es'
    router.push(`/${locale}/admin/login`)
  }

  // Extract locale from pathname for navigation
  const locale = pathname?.split('/')[1] || 'es'

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Admin Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo & Badge */}
              <div className="flex items-center gap-2 sm:gap-4">
                <Link href={`/${locale}`} className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>🎵</span>
                  <span className="hidden xs:inline">RadioApp</span>
                </Link>
                <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 px-2 sm:px-3 py-1 bg-red-100 dark:bg-red-900/20 rounded-full">
                  Admin
                </span>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-2">
                {adminNavItems.map((item) => {
                  const fullPath = `/${locale}${item.href}`
                  const isActive = pathname === fullPath
                  return (
                    <Link
                      key={item.href}
                      href={fullPath}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-2 sm:gap-3">
                <Link
                  href={`/${locale}`}
                  className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <span className="hidden sm:inline">Back to App</span>
                  <span className="sm:hidden">App</span>
                  <span className="ml-1">→</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Logout"
                >
                  <span className="sm:hidden">🚪</span>
                  <span className="hidden sm:inline">🚪 Logout</span>
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="px-4 py-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
                {adminNavItems.map((item) => {
                  const fullPath = `/${locale}${item.href}`
                  const isActive = pathname === fullPath
                  return (
                    <Link
                      key={item.href}
                      href={fullPath}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
                
                <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
                  <Link
                    href={`/${locale}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-xl">←</span>
                    <span>Back to App</span>
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <span className="text-xl">🚪</span>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Admin Content */}
        <main className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </AdminGuard>
  )
}

'use client'

import { AdminGuard } from '@/components/AdminGuard'
import { useInitializeApi } from '@/hooks/useInitializeApi'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@radio-app/app'

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { href: '/admin/translations', label: 'Translations', icon: '🌍' },
  { href: '/admin/seo', label: 'SEO', icon: '🔍' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()
  
  // Initialize API client with token storage (must be before any early return)
  useInitializeApi()

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
      console.error('Logout error:', error)
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
              <div className="flex items-center gap-8">
                <Link href={`/${locale}`} className="text-xl font-bold text-gray-900 dark:text-white">
                  🎵 RadioApp
                </Link>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 px-3 py-1 bg-red-100 dark:bg-red-900/20 rounded-full">
                  Admin Panel
                </span>
              </div>
              
              <nav className="flex items-center gap-6">
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
                      <span className="hidden sm:inline">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>

              <div className="flex items-center gap-3">
                <Link
                  href={`/${locale}`}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Back to App →
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Logout"
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Admin Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </AdminGuard>
  )
}

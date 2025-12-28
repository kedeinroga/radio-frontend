'use client'

import { useState } from 'react'
import { clientAdminApi } from '@/lib/clientAdminApi'

export default function SEOPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const handleRefreshStats = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      setResult(null)

      const response = await clientAdminApi.refreshSEOStats()
      
      setSuccess(true)
      setResult(response)
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 5000)
    } catch (err: any) {
      console.error('Error refreshing SEO stats:', err)
      setError(err.response?.data?.message || err.message || 'Failed to refresh SEO statistics')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SEO Management</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Refresh and manage SEO statistics for tags and countries
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <h3 className="text-green-800 dark:text-green-200 font-semibold mb-2">
                SEO Statistics Refreshed Successfully
              </h3>
              <p className="text-green-600 dark:text-green-300">
                The SEO statistics have been updated from the database.
              </p>
              {result && (
                <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/40 rounded-lg">
                  <pre className="text-xs text-green-800 dark:text-green-200 overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Error</h3>
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔍</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Refresh SEO Statistics
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This action will update the cached statistics for popular tags and countries from the database.
            This process may take a few seconds to complete.
          </p>

          <button
            onClick={handleRefreshStats}
            disabled={loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              <>
                <span>🔄</span>
                Refresh Statistics
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What Gets Updated */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>📊</span>
            What Gets Updated
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Popular tags with station counts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Popular countries with station counts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>Sitemap data cache</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>SEO metadata for dynamic pages</span>
            </li>
          </ul>
        </div>

        {/* When to Use */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <span>⏰</span>
            When to Use
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">→</span>
              <span>After importing new stations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">→</span>
              <span>When station data changes significantly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">→</span>
              <span>To update sitemap.xml data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">→</span>
              <span>When SEO data seems outdated</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

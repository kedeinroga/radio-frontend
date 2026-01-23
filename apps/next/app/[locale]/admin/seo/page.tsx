'use client'

import { useEffect, useState } from 'react'
import { clientAdminApi } from '@/lib/clientAdminApi'

interface TagStat {
  tag: string
  count: number
}

interface CountryStat {
  country: string
  country_code: string
  count: number
}

interface SEOStats {
  popular_tags?: TagStat[]
  popular_countries?: CountryStat[]
  total_stations?: number
  last_updated?: string
}

export default function SEOPage() {
  const [refreshing, setRefreshing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<SEOStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)

  // Don't auto-load stats on mount since endpoint may not exist
  // User can manually refresh to load stats
  useEffect(() => {
    // Optional: Try to load stats silently without showing errors
    // Commented out until backend implements /admin/seo/stats endpoint
    // loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoadingStats(true)
      setError(null)
      const response = await clientAdminApi.getSEOStats()
      setStats(response.data || {})
    } catch (err: any) {
      // Silently fail - don't show error to user
      // Backend can implement this endpoint later
      setStats({})
    } finally {
      setLoadingStats(false)
    }
  }

  const handleRefreshStats = async () => {
    try {
      setRefreshing(true)
      setError(null)
      setSuccess(false)

      await clientAdminApi.refreshSEOStats()
      
      setSuccess(true)
      
      // Reload stats after refresh
      await loadStats()
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 5000)
    } catch (err: any) {

      setError(err.response?.data?.message || err.message || 'Failed to refresh SEO statistics')
    } finally {
      setRefreshing(false)
    }
  }

  const popularTags = stats?.popular_tags || []
  const popularCountries = stats?.popular_countries || []
  const totalStations = stats?.total_stations || 0
  const lastUpdated = stats?.last_updated

  // Check if we have any data at all
  const hasData = popularTags.length > 0 || popularCountries.length > 0 || totalStations > 0

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">SEO Management</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Manage and refresh SEO statistics for tags and countries
          </p>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefreshStats}
          disabled={refreshing}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-sm"
        >
          {refreshing ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Refreshing...
            </>
          ) : (
            <>
              🔄 Refresh Statistics
            </>
          )}
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="text-xl sm:text-2xl">✅</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-green-800 dark:text-green-200 font-semibold mb-1">
                SEO Statistics Refreshed Successfully
              </h3>
              <p className="text-sm text-green-600 dark:text-green-300">
                The SEO statistics have been updated from the database.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="text-xl sm:text-2xl">❌</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-red-800 dark:text-red-200 font-semibold mb-1">Error</h3>
              <p className="text-sm text-red-600 dark:text-red-300 break-words">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Info Message - No Data */}
      {!hasData && !loadingStats && !error && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="text-xl sm:text-2xl">ℹ️</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-blue-800 dark:text-blue-200 font-semibold mb-1">No Statistics Available</h3>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                SEO statistics will be available after the backend implements the stats endpoint. 
                You can still use the refresh button to update statistics when available.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Stations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl sm:text-3xl">📻</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Stations</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {totalStations.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Popular Tags Count */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl sm:text-3xl">🏷️</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Popular Tags</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {popularTags.length}
              </p>
            </div>
          </div>
        </div>

        {/* Popular Countries Count */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-2xl sm:text-3xl">🌍</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Countries</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {popularCountries.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-center">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date(lastUpdated).toLocaleString()}
          </p>
        </div>
      )}

      {/* Popular Tags and Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Popular Tags */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span>🏷️</span>
              Popular Tags
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Most used tags across stations
            </p>
          </div>
          <div className="p-4 sm:p-6">
            {popularTags.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No tag statistics available
              </p>
            ) : (
              <div className="space-y-2 sm:space-y-3 max-h-[400px] overflow-y-auto">
                {popularTags.slice(0, 20).map((tag, index) => (
                  <div key={tag.tag} className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 w-6 text-right flex-shrink-0">
                      #{index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {tag.tag}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 flex-shrink-0">
                          {tag.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                        <div 
                          className="bg-blue-600 dark:bg-blue-500 h-1.5 sm:h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(100, (tag.count / (popularTags[0]?.count || 1)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Popular Countries */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span>🌍</span>
              Popular Countries
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Countries with most stations
            </p>
          </div>
          <div className="p-4 sm:p-6">
            {popularCountries.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No country statistics available
              </p>
            ) : (
              <div className="space-y-2 sm:space-y-3 max-h-[400px] overflow-y-auto">
                {popularCountries.slice(0, 20).map((country, index) => (
                  <div key={country.country_code} className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 w-6 text-right flex-shrink-0">
                      #{index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2 truncate">
                          <span className="text-base sm:text-lg">{getFlagEmoji(country.country_code)}</span>
                          <span className="truncate">{country.country}</span>
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400 flex-shrink-0">
                          {country.count.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
                        <div 
                          className="bg-green-600 dark:bg-green-500 h-1.5 sm:h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(100, (country.count / (popularCountries[0]?.count || 1)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* What Gets Updated */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <span>📊</span>
            What Gets Updated
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
              <span>Popular tags with station counts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
              <span>Popular countries with station counts</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
              <span>Sitemap data cache</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
              <span>SEO metadata for dynamic pages</span>
            </li>
          </ul>
        </div>

        {/* When to Use */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <span>⏰</span>
            When to Use
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5 flex-shrink-0">→</span>
              <span>After importing new stations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5 flex-shrink-0">→</span>
              <span>When station data changes significantly</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5 flex-shrink-0">→</span>
              <span>To update sitemap.xml data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5 flex-shrink-0">→</span>
              <span>When SEO data seems outdated</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

// Helper function to get flag emoji from country code
function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🏳️'
  
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  
  return String.fromCodePoint(...codePoints)
}

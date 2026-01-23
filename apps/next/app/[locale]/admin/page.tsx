'use client'

import { useEffect, useState } from 'react'
import { clientAdminApi } from '@/lib/clientAdminApi'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import Link from 'next/link'

interface PopularStation {
  station_id: string
  name: string
  country: string
  plays: number
  favicon?: string
  url?: string
}

interface TrendingSearch {
  search_term: string
  count: number
  percentage?: number
}

interface DashboardStats {
  activeUsers: number
  guestUsers: number
  popularStations: PopularStation[]
  trendingSearches: TrendingSearch[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [activeUsersRes, guestUsersRes, popularStationsRes, trendingSearchesRes] = await Promise.all([
        clientAdminApi.getActiveUsers(),
        clientAdminApi.getGuestUsers(),
        clientAdminApi.getPopularStations('day', 5),
        clientAdminApi.getTrendingSearches('day', 5),
      ])

      setStats({
        activeUsers: activeUsersRes.data?.count || 0,
        guestUsers: guestUsersRes.data?.count || 0,
        popularStations: popularStationsRes.data || [],
        trendingSearches: trendingSearchesRes.data || [],
      })
    } catch (err: any) {

      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner message="Loading dashboard..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Error Loading Dashboard</h3>
        <p className="text-red-600 dark:text-red-300">{error}</p>
        <button
          onClick={loadDashboardData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Overview of system statistics and activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Active Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
              👥
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {(stats?.activeUsers || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Authenticated</p>
            </div>
          </div>
        </div>

        {/* Guest Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
              👤
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Guest Users</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {(stats?.guestUsers || 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 24h</p>
            </div>
          </div>
        </div>

        {/* Popular Stations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
              📻
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Popular Stations</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.popularStations?.length || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Top today</p>
            </div>
          </div>
        </div>

        {/* Trending Searches */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
              🔍
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Trending Searches</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.trendingSearches?.length || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Top queries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <QuickActionButton
            href="/admin/analytics"
            icon="📈"
            label="Analytics"
          />
          <QuickActionButton
            href="/admin/monitoring"
            icon="�"
            label="Monitoring"
          />
          <QuickActionButton
            href="/admin/maintenance"
            icon="⚙️"
            label="Maintenance"
          />
          <QuickActionButton
            href="/admin/translations"
            icon="🌍"
            label="Translations"
          />
          <QuickActionButton
            href="/admin/seo"
            icon="🔍"
            label="SEO"
          />
          <QuickActionButton
            href="/admin/security"
            icon="🛡️"
            label="Security"
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Popular Stations Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
              Top Stations Today
            </h2>
            <Link
              href="/admin/analytics"
              className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
            >
              View all →
            </Link>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              {stats?.popularStations && stats.popularStations.length > 0 ? (
                stats.popularStations.slice(0, 5).map((station, index) => (
                  <div
                    key={station.station_id || index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <span className="text-base sm:text-lg font-bold text-gray-400 dark:text-gray-500 flex-shrink-0">
                        {index + 1}
                      </span>
                      {station.favicon && (
                        <img
                          src={station.favicon}
                          alt={station.name}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded flex-shrink-0 object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {station.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {station.country}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                        {station.plays.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">plays</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No data available
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Trending Searches Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
              Trending Searches Today
            </h2>
            <Link
              href="/admin/analytics"
              className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
            >
              View all →
            </Link>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              {stats?.trendingSearches && stats.trendingSearches.length > 0 ? (
                stats.trendingSearches.slice(0, 5).map((search, index) => (
                  <div
                    key={search.search_term || index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <span className="text-base sm:text-lg font-bold text-gray-400 dark:text-gray-500 flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {search.search_term}
                        </p>
                        {search.percentage !== undefined && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {search.percentage.toFixed(1)}% of searches
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                        {search.count.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">searches</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No data available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Resources */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <ResourceCard
          href="/admin/sessions"
          title="Active Sessions"
          description="Manage user sessions and security"
          icon="🔐"
          color="blue"
        />
        <ResourceCard
          href="/"
          title="Back to App"
          description="Return to main application"
          icon="🏠"
          color="green"
        />
        <ResourceCard
          href="/admin/analytics"
          title="Full Analytics"
          description="View detailed statistics"
          icon="📊"
          color="purple"
        />
      </div>
    </div>
  )
}

function QuickActionButton({
  href,
  icon,
  label,
}: {
  href: string
  icon: string
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all group"
    >
      <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{icon}</div>
      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-center">
        {label}
      </span>
    </Link>
  )
}

function ResourceCard({
  href,
  title,
  description,
  icon,
  color,
}: {
  href: string
  title: string
  description: string
  icon: string
  color: 'blue' | 'green' | 'purple'
}) {
  const colorClasses = {
    blue: 'border-blue-200 dark:border-blue-800 hover:border-blue-500 dark:hover:border-blue-500',
    green: 'border-green-200 dark:border-green-800 hover:border-green-500 dark:hover:border-green-500',
    purple: 'border-purple-200 dark:border-purple-800 hover:border-purple-500 dark:hover:border-purple-500',
  }

  return (
    <Link
      href={href}
      className={`block p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${colorClasses[color]} transition-all hover:shadow-md group`}
    >
      <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{icon}</div>
      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  )
}

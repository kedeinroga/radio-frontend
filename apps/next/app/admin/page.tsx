'use client'

import { useEffect, useState } from 'react'
import { adminApiRepository } from '@radio-app/app'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import Link from 'next/link'

interface DashboardStats {
  activeUsers: number
  popularStations: any[]
  trendingSearches: any[]
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

      const [activeUsersRes, popularStationsRes, trendingSearchesRes] = await Promise.all([
        adminApiRepository.getActiveUsers(),
        adminApiRepository.getPopularStations('day', 5),
        adminApiRepository.getTrendingSearches('day', 5),
      ])

      setStats({
        activeUsers: activeUsersRes.data?.count || 0,
        popularStations: popularStationsRes.data || [],
        trendingSearches: trendingSearchesRes.data || [],
      })
    } catch (err: any) {
      console.error('Error loading dashboard:', err)
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Overview of system statistics and activity
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Users */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-2xl">
              👥
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.activeUsers || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Popular Stations */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-2xl">
              📻
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Popular Stations</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.popularStations?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Trending Searches */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-2xl">
              🔍
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Trending Searches</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats?.trendingSearches?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickLinkCard
          href="/admin/analytics"
          title="View Analytics"
          description="Detailed statistics and insights"
          icon="📈"
        />
        <QuickLinkCard
          href="/admin/translations"
          title="Manage Translations"
          description="Add or edit station translations"
          icon="🌍"
        />
        <QuickLinkCard
          href="/admin/seo"
          title="SEO Tools"
          description="Refresh SEO statistics"
          icon="🔍"
        />
        <QuickLinkCard
          href="/"
          title="Back to App"
          description="Return to main application"
          icon="🏠"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Stations Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Top Stations Today
          </h2>
          <div className="space-y-3">
            {stats?.popularStations?.slice(0, 5).map((station: any, index: number) => (
              <div
                key={station.station_id || index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400 dark:text-gray-500">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {station.station_name || 'Unknown Station'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {station.play_count || 0} plays
                    </p>
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No data available
              </p>
            )}
          </div>
        </div>

        {/* Trending Searches Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Trending Searches Today
          </h2>
          <div className="space-y-3">
            {stats?.trendingSearches?.slice(0, 5).map((search: any, index: number) => (
              <div
                key={search.query || index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-400 dark:text-gray-500">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {search.query || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {search.count || 0} searches
                    </p>
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No data available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickLinkCard({
  href,
  title,
  description,
  icon,
}: {
  href: string
  title: string
  description: string
  icon: string
}) {
  return (
    <Link
      href={href}
      className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  )
}

'use client'

import { Fragment, useEffect, useState } from 'react'
import { clientAdminApi } from '@/lib/clientAdminApi'
import { LoadingSpinner } from '@/components/LoadingSpinner'

type TimeRange = 'hour' | 'day' | 'week' | 'month'

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

interface GuestEndpoint {
  method: string
  path: string
  count: number
}

interface GuestUserDetail {
  ip_address: string
  total_requests: number
  unique_endpoints: number
  user_agent?: string
  first_seen: string
  last_seen: string
  endpoints: GuestEndpoint[]
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('day')
  const [activeUsers, setActiveUsers] = useState<number>(0)
  const [guestUsers, setGuestUsers] = useState<number>(0)
  const [popularStations, setPopularStations] = useState<PopularStation[]>([])
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>([])
  const [guestDetails, setGuestDetails] = useState<GuestUserDetail[]>([])
  const [expandedIPs, setExpandedIPs] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const [usersRes, guestRes, stationsRes, searchesRes, guestDetailsRes] = await Promise.all([
        clientAdminApi.getActiveUsers(),
        clientAdminApi.getGuestUsers(),
        clientAdminApi.getPopularStations(timeRange, 20),
        clientAdminApi.getTrendingSearches(timeRange, 20),
        clientAdminApi.getGuestUserDetails(timeRange, 100),
      ])

      setActiveUsers(usersRes.data?.data?.count || 0)
      setGuestUsers(guestRes.data?.data?.count || 0)
      setPopularStations(stationsRes.data?.data || [])
      setTrendingSearches(searchesRes.data?.data || [])
      setGuestDetails(guestDetailsRes.data?.data || [])
    } catch (err: any) {

      setError(err.response?.data?.message || err.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner message="Loading analytics..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Detailed statistics and user behavior insights
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 overflow-x-auto">
          {(['hour', 'day', 'week', 'month'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {range === 'hour' ? 'Last Hour' : range === 'day' ? 'Today' : range === 'week' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 sm:p-6">
          <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Error Loading Analytics</h3>
          <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
          <button
            onClick={loadAnalytics}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Active Users"
          value={activeUsers}
          subtitle="Authenticated"
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Guest Users"
          value={guestUsers}
          subtitle="Last 24h"
          icon="👤"
          color="indigo"
        />
        <StatCard
          title="Popular Stations"
          value={popularStations.length}
          subtitle={`Top ${timeRange}`}
          icon="📻"
          color="green"
        />
        <StatCard
          title="Trending Searches"
          value={trendingSearches.length}
          subtitle="Top queries"
          icon="🔍"
          color="purple"
        />
      </div>

      {/* Popular Stations Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Popular Stations
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Most played stations in the selected time range
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Station
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Plays
                </th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Station ID
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {popularStations.length > 0 ? (
                popularStations.map((station, index) => (
                  <tr key={station.station_id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className="text-sm sm:text-lg font-bold text-gray-400 dark:text-gray-500">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {station.favicon && (
                          <img
                            src={station.favicon}
                            alt={station.name}
                            className="w-6 h-6 sm:w-8 sm:h-8 rounded object-cover flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                            {station.name || 'Unknown Station'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {station.country}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900 dark:text-white font-semibold">
                        {(station.plays || 0).toLocaleString()}
                      </div>
                      {/* Progress bar for visual representation */}
                      <div className="w-16 sm:w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                        <div 
                          className="bg-green-600 dark:bg-green-500 h-1 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(100, ((station.plays || 0) / (popularStations[0]?.plays || 1)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                        {station.station_id}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-3 sm:px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No data available for the selected time range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trending Searches Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Trending Searches
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Most frequent search queries in the selected time range
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Search Query
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Count
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {trendingSearches.length > 0 ? (
                trendingSearches.map((search, index) => (
                  <tr key={search.search_term || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className="text-sm sm:text-lg font-bold text-gray-400 dark:text-gray-500">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                        {search.search_term || 'Unknown'}
                      </div>
                      {search.percentage !== undefined && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {search.percentage.toFixed(1)}% of total
                        </div>
                      )}
                      {/* Visual bar */}
                      <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-2">
                        <div 
                          className="bg-purple-600 dark:bg-purple-500 h-1 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(100, ((search.count || 0) / (trendingSearches[0]?.count || 1)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-xs sm:text-sm text-gray-900 dark:text-white font-semibold">
                        {(search.count || 0).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-3 sm:px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No data available for the selected time range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guest User Details Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Guest User Details
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Request details per IP address — click a row to expand endpoint breakdown
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Requests</th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Endpoints</th>
                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">First Seen</th>
                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Seen</th>
                <th className="hidden xl:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {guestDetails.length > 0 ? (
                guestDetails.map((guest, index) => {
                  const isExpanded = expandedIPs.has(guest.ip_address)
                  return (
                    <Fragment key={guest.ip_address || index}>
                      <tr
                        onClick={() => setExpandedIPs(prev => {
                          const next = new Set(prev)
                          isExpanded ? next.delete(guest.ip_address) : next.add(guest.ip_address)
                          return next
                        })}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer select-none"
                      >
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 dark:text-gray-500 text-xs">{isExpanded ? '▼' : '▶'}</span>
                            <span className="text-xs sm:text-sm font-mono text-gray-900 dark:text-white">
                              {guest.ip_address}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                            {(guest.total_requests || 0).toLocaleString()}
                          </div>
                          <div className="w-16 sm:w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                            <div
                              className="bg-indigo-600 dark:bg-indigo-500 h-1 rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, ((guest.total_requests || 0) / (guestDetails[0]?.total_requests || 1)) * 100)}%`
                              }}
                            />
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                            {guest.unique_endpoints}
                          </div>
                        </td>
                        <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(guest.first_seen).toLocaleString()}
                          </div>
                        </td>
                        <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(guest.last_seen).toLocaleString()}
                          </div>
                        </td>
                        <td className="hidden xl:table-cell px-3 sm:px-6 py-4 max-w-xs">
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate" title={guest.user_agent}>
                            {guest.user_agent || '—'}
                          </div>
                        </td>
                      </tr>
                      {isExpanded && guest.endpoints?.length > 0 && (
                        <tr className="bg-gray-50 dark:bg-gray-900/40">
                          <td colSpan={6} className="px-6 sm:px-10 py-3">
                            <div className="space-y-1">
                              {guest.endpoints.map((ep, i) => (
                                <div key={i} className="flex items-center gap-3 text-xs">
                                  <span className={`font-mono font-bold w-12 text-center rounded px-1 py-0.5 ${
                                    ep.method === 'GET'
                                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                                      : ep.method === 'POST'
                                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                  }`}>
                                    {ep.method}
                                  </span>
                                  <span className="font-mono text-gray-700 dark:text-gray-300 flex-1 truncate">
                                    {ep.path}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    {ep.count.toLocaleString()} req
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-3 sm:px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No guest activity in the selected time range
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string
  value: number
  subtitle?: string
  icon: string
  color: 'blue' | 'indigo' | 'green' | 'purple'
}) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {(value || 0).toLocaleString()}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )
}

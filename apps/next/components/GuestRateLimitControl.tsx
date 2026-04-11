'use client'

import { useState, useEffect } from 'react'
import { Shield, ShieldOff, Loader2, RefreshCw } from 'lucide-react'
import { clientAdminApi } from '@/lib/clientAdminApi'

interface RateLimitStatus {
  enabled: boolean
  limit_per_hour: number
}

export function GuestRateLimitControl() {
  const [status, setStatus] = useState<RateLimitStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await clientAdminApi.getGuestRateLimitStatus()
      setStatus(res.data?.data ?? null)
    } catch (err: any) {
      setError(err.message || 'Failed to load rate limit status')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async () => {
    try {
      setToggling(true)
      setError(null)
      const res = await clientAdminApi.toggleGuestRateLimit()
      setStatus(res.data?.data ?? null)
    } catch (err: any) {
      setError(err.message || 'Failed to toggle rate limiter')
    } finally {
      setToggling(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
            status?.enabled
              ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
          }`}>
            {status?.enabled
              ? <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
              : <ShieldOff className="h-5 w-5 sm:h-6 sm:w-6" />
            }
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              Guest IP Rate Limiter
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Limits unauthenticated requests per IP address
            </p>
          </div>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading || toggling}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </div>
      ) : error ? (
        <div className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</div>
      ) : status ? (
        <div className="mt-4 space-y-4">
          {/* Status + limit */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Status
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                status.enabled
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                {status.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Limit
              </span>
              <span className="text-xs font-mono text-gray-700 dark:text-gray-300">
                {status.limit_per_hour.toLocaleString()} req / hour
              </span>
            </div>
          </div>

          {/* Toggle button */}
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              status.enabled
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800'
                : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800'
            }`}
          >
            {toggling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status.enabled ? (
              <ShieldOff className="h-4 w-4" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            {toggling ? 'Updating...' : status.enabled ? 'Disable limiter' : 'Enable limiter'}
          </button>
        </div>
      ) : null}
    </div>
  )
}

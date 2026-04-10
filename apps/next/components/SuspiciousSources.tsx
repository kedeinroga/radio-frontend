'use client'

import { useState, useEffect } from 'react'
import { AlertTriangle, Globe, MapPin, FileText, Loader2, RefreshCw } from 'lucide-react'

interface BySource {
  source: string
  count: number
}

interface TopIP {
  ip: string
  count: number
  last_seen: string
}

interface TopPath {
  path: string
  count: number
}

interface SuspiciousSourcesData {
  period: string
  total_count: number
  by_source: BySource[]
  top_ips: TopIP[]
  top_paths: TopPath[]
}

type Period = '24h' | '7d' | '30d'

const PERIOD_LABELS: Record<Period, string> = {
  '24h': 'Last 24h',
  '7d': 'Last 7 Days',
  '30d': 'Last 30 Days',
}

function formatDate(dateString: string) {
  try {
    return new Date(dateString).toLocaleString()
  } catch {
    return dateString
  }
}

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate w-28 flex-shrink-0" title={label}>
        {label}
      </span>
      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-orange-500 h-2 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-900 dark:text-white w-8 text-right flex-shrink-0">
        {count}
      </span>
    </div>
  )
}

export function SuspiciousSources() {
  const [data, setData] = useState<SuspiciousSourcesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<Period>('24h')

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/security/suspicious-sources?period=${period}`, {
        credentials: 'include',
        signal: AbortSignal.timeout(10000),
      })

      if (response.status === 403) {
        throw new Error('Access denied. Admin permissions required.')
      }
      if (!response.status.toString().startsWith('2')) {
        throw new Error('Failed to load suspicious sources')
      }

      const json: SuspiciousSourcesData = await response.json()
      setData(json)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [period])

  const maxSourceCount = data ? Math.max(...data.by_source.map((s) => s.count), 1) : 1
  const maxPathCount = data ? Math.max(...data.top_paths.map((p) => p.count), 1) : 1

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Suspicious Sources
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  period === p
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && !data && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          <p className="font-semibold">Error loading suspicious sources</p>
          <p className="text-sm">{error}</p>
          <button onClick={load} className="mt-2 text-sm underline hover:no-underline">
            Try again
          </button>
        </div>
      )}

      {/* Content */}
      {data && !loading && (
        <>
          {/* Total badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
              {data.total_count} suspicious requests in {PERIOD_LABELS[period as Period] ?? period}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* By Source */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="h-4 w-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">By Source</h3>
              </div>
              {data.by_source.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No data</p>
              ) : (
                <div className="space-y-3">
                  {data.by_source.map((s) => (
                    <BarRow key={s.source} label={s.source} count={s.count} max={maxSourceCount} />
                  ))}
                </div>
              )}
            </div>

            {/* Top IPs */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top IPs</h3>
              </div>
              {data.top_ips.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No data</p>
              ) : (
                <div className="space-y-3">
                  {data.top_ips.map((ip) => (
                    <div key={ip.ip} className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-mono font-medium text-gray-900 dark:text-white truncate">
                          {ip.ip}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          Last: {formatDate(ip.last_seen)}
                        </p>
                      </div>
                      <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                        {ip.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Paths */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-gray-500" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top Paths</h3>
              </div>
              {data.top_paths.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No data</p>
              ) : (
                <div className="space-y-3">
                  {data.top_paths.map((p) => (
                    <BarRow key={p.path} label={p.path} count={p.count} max={maxPathCount} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

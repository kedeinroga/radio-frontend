'use client'

import { useEffect, useState } from 'react'
import { clientAdminApi } from '@/lib/clientAdminApi'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface Alert {
  level: 'info' | 'warning' | 'critical'
  category: string
  message: string
  action: string
  resolved: boolean
  timestamp: string
}

interface HealthMetrics {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  database: {
    status: string
    ping: boolean
    connections: number
    max_connections: number
    usage_percent: number
  }
  redis: {
    status: string
    ping: boolean
    memory_mb: number
    usage_percent: number
  }
  external_api: {
    status: string
    circuit_breaker: string
    error_count: number
    last_error: string
    avg_response_time_ms: number
  }
  partitions: {
    status: string
    total_partitions: number
    missing_future_partitions: number
    old_partitions_count: number
    last_check: string
  }
  materialized_views: {
    status: string
    total_views: number
    stale_views: string[]
    last_refresh: string
    failed_refreshes: number
    avg_refresh_duration_ms: number
  }
  performance_metrics: {
    requests_per_second: number
    avg_response_time_ms: number
    error_rate_percent: number
    cache_hit_rate_percent: number
  }
  alerts: Alert[]
}

export default function MonitoringPage() {
  const [loading, setLoading] = useState(true)
  const [health, setHealth] = useState<HealthMetrics | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  useEffect(() => {
    loadData()

    if (autoRefresh) {
      const interval = setInterval(() => {
        loadData()
      }, 30000) // Refresh every 30 seconds
      
      return () => clearInterval(interval)
    }
    
    return undefined
  }, [autoRefresh])

  const loadData = async () => {
    try {
      setError(null)

      const [healthRes, alertsRes] = await Promise.all([
        clientAdminApi.getHealthMetrics(),
        clientAdminApi.getAlerts(),
      ])

      // Check if response has data directly or nested
      if (healthRes.data) {
        const healthData = healthRes.data.success ? healthRes.data.data : healthRes.data
        setHealth(healthData)
      }

      if (alertsRes.data) {
        const alertsData = alertsRes.data.success 
          ? (alertsRes.data.data?.alerts || alertsRes.data.data || [])
          : (alertsRes.data.alerts || [])
        setAlerts(alertsData)
      }

      setLastUpdate(new Date())
    } catch (err) {
      console.error('Load data error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load monitoring data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-500'
      case 'degraded':
        return 'bg-yellow-500'
      case 'unhealthy':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-700 dark:text-green-300'
      case 'degraded':
        return 'text-yellow-700 dark:text-yellow-300'
      case 'unhealthy':
        return 'text-red-700 dark:text-red-300'
      default:
        return 'text-gray-700 dark:text-gray-300'
    }
  }

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      case 'info':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
      default:
        return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return '🔴'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '●'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">System Monitoring</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Real-time system health and performance metrics
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300">Auto-refresh (30s)</span>
          </label>
          <button
            onClick={loadData}
            className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
          >
            🔄 Refresh Now
          </button>
        </div>
      </div>

      {/* Last Update */}
      {lastUpdate && (
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm sm:text-base">
            <span className="text-xl flex-shrink-0">❌</span>
            <span className="break-words">{error}</span>
          </div>
        </div>
      )}

      {/* System Status Overview */}
      {health && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">System Status</h2>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${getStatusColor(health.status)} animate-pulse`}></div>
                <span className={`font-bold text-lg sm:text-xl uppercase ${getStatusTextColor(health.status)}`}>
                  {health.status}
                </span>
              </div>
            </div>

            {/* Component Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Database Health */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">🗄️</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Database</h3>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(health.database?.status || 'unknown')}`}></div>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Connections:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {health.database?.connections || 0}/{health.database?.max_connections || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Usage:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(health.database?.usage_percent || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Ping:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {health.database?.ping ? '✓ OK' : '✗ Failed'}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        (health.database?.usage_percent || 0) > 80 ? 'bg-red-500' : 
                        (health.database?.usage_percent || 0) > 60 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${health.database?.usage_percent || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Redis Health */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">⚡</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Redis Cache</h3>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(health.redis?.status || 'unknown')}`}></div>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Memory:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {health.redis?.memory_mb || 0} MB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Usage:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(health.redis?.usage_percent || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Ping:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {health.redis?.ping ? '✓ OK' : '✗ Failed'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full ${
                        (health.redis?.usage_percent || 0) > 80 ? 'bg-red-500' : 
                        (health.redis?.usage_percent || 0) > 60 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${health.redis?.usage_percent || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* External API Health */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">🌐</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">External API</h3>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(health.external_api?.status || 'unknown')}`}></div>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-gray-600 dark:text-gray-400 truncate">Circuit Breaker:</span>
                    <span className="font-medium text-gray-900 dark:text-white uppercase text-xs whitespace-nowrap">
                      {health.external_api?.circuit_breaker || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Errors:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {health.external_api?.error_count || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg Response:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {health.external_api?.avg_response_time_ms || 0}ms
                    </span>
                  </div>
                </div>
              </div>

              {/* Partitions Health */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">📦</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Partitions</h3>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(health.partitions?.status || 'unknown')}`}></div>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {health.partitions?.total_partitions || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 truncate">Missing Future:</span>
                    <span className={`font-medium whitespace-nowrap ${(health.partitions?.missing_future_partitions || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                      {health.partitions?.missing_future_partitions || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Old Partitions:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {health.partitions?.old_partitions_count || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Materialized Views Health */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">👁️</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Mat. Views</h3>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(health.materialized_views?.status || 'unknown')}`}></div>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Views:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {health.materialized_views?.total_views || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Stale:</span>
                    <span className={`font-medium ${(health.materialized_views?.stale_views?.length || 0) > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>
                      {health.materialized_views?.stale_views?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Failed:</span>
                    <span className={`font-medium ${(health.materialized_views?.failed_refreshes || 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                      {health.materialized_views?.failed_refreshes || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">📊</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">Performance</h3>
                  </div>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Req/sec:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(health.performance_metrics?.requests_per_second || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg Response:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(health.performance_metrics?.avg_response_time_ms || 0).toFixed(0)}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Error Rate:</span>
                    <span className={`font-medium ${(health.performance_metrics?.error_rate_percent || 0) > 5 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                      {(health.performance_metrics?.error_rate_percent || 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cache Hit:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(health.performance_metrics?.cache_hit_rate_percent || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Alerts */}
          {alerts.length > 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Active Alerts ({alerts.length})
              </h2>
              <div className="space-y-3">
                {alerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.level)}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xl">{getAlertIcon(alert.level)}</span>
                          <span className="font-bold text-xs sm:text-sm uppercase text-gray-700 dark:text-gray-300">
                            {alert.level}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">•</span>
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{alert.category}</span>
                        </div>
                        <div className="text-sm sm:text-base text-gray-900 dark:text-white font-medium mb-2 break-words">{alert.message}</div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 italic break-words">{alert.action}</div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 sm:whitespace-nowrap self-end sm:self-auto">
                        {new Date(alert.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6 sm:p-8 text-center">
              <div className="text-4xl sm:text-6xl mb-4">✅</div>
              <div className="text-green-700 dark:text-green-300 text-lg sm:text-xl font-semibold mb-2">
                No Active Alerts
              </div>
              <div className="text-green-600 dark:text-green-400 text-xs sm:text-sm">
                System is operating normally with no issues detected
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

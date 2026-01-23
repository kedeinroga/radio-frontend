'use client'

import { useEffect, useState } from 'react'
import { clientAdminApi } from '@/lib/clientAdminApi'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface PartitionInfo {
  partition_name: string
  table_name: string
  start_date: string
  end_date: string
  size_mb: number
  row_count: number
  created_at: string
}

interface MaintenanceRecommendation {
  operation: string
  priority: 'info' | 'warning' | 'critical'
  reason: string
  should_run: boolean
  details?: Record<string, any>
}

export default function MaintenancePage() {
  const [loading, setLoading] = useState(true)
  const [partitions, setPartitions] = useState<PartitionInfo[]>([])
  const [totalPartitions, setTotalPartitions] = useState(0)
  const [totalSize, setTotalSize] = useState(0)
  const [recommendations, setRecommendations] = useState<MaintenanceRecommendation[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [partitionsRes, recommendationsRes] = await Promise.all([
        clientAdminApi.getPartitionStatus(),
        clientAdminApi.getMaintenanceRecommendations(),
      ])

      // Handle partitions data
      if (partitionsRes.data) {
        const partData = partitionsRes.data.success ? partitionsRes.data.data : partitionsRes.data
        setPartitions(partData.partitions || [])
        setTotalPartitions(partData.total_partitions || 0)
        setTotalSize(partData.total_size_mb || 0)
      }

      // Handle recommendations data
      if (recommendationsRes.data) {
        const recData = recommendationsRes.data.success ? recommendationsRes.data.data : recommendationsRes.data
        setRecommendations(Array.isArray(recData) ? recData : [])
      }
    } catch (err) {

      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshViews = async (viewType: 'seo' | 'analytics' | 'all') => {
    try {
      setIsRunning(true)
      setError(null)
      setSuccessMessage(null)
      
      await clientAdminApi.refreshViews(viewType)
      setSuccessMessage(`Successfully refreshed ${viewType} views`)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh views')
    } finally {
      setIsRunning(false)
    }
  }

  const handleFullMaintenance = async () => {
    if (!window.confirm('Run full maintenance? This may take several minutes.')) return

    try {
      setIsRunning(true)
      setError(null)
      setSuccessMessage(null)

      await clientAdminApi.performFullMaintenance()
      setSuccessMessage('Maintenance completed successfully!')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run maintenance')
    } finally {
      setIsRunning(false)
    }
  }

  const handleCleanupPartitions = async () => {
    const months = window.prompt('Enter retention period in months (e.g., 6):')
    if (!months) return

    const retentionMonths = parseInt(months, 10)
    if (isNaN(retentionMonths) || retentionMonths < 1) {
      setError('Invalid number of months')
      return
    }

    if (!window.confirm(`Delete partitions older than ${retentionMonths} months?`)) return

    try {
      setIsRunning(true)
      setError(null)
      setSuccessMessage(null)

      const result = await clientAdminApi.cleanupPartitions(retentionMonths)
      const freedSpace = result.data.data?.freed_space_mb || 0
      setSuccessMessage(`Cleaned up partitions: ${freedSpace.toFixed(2)} MB freed`)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cleanup partitions')
    } finally {
      setIsRunning(false)
    }
  }

  const handleCheckPartitions = async () => {
    try {
      setIsRunning(true)
      setError(null)
      setSuccessMessage(null)

      const result = await clientAdminApi.checkPartitions()
      const status = result.data.data?.status || 'unknown'
      const message = result.data.data?.message || 'Check completed'
      
      if (status === 'ok') {
        setSuccessMessage(`✓ ${message}`)
      } else {
        setError(`⚠ ${message}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check partitions')
    } finally {
      setIsRunning(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20'
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white'
      case 'warning':
        return 'bg-yellow-500 text-white'
      default:
        return 'bg-blue-500 text-white'
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Database Maintenance</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
            Manage database partitions, materialized views, and system optimization
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isRunning}
          className="w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors text-sm sm:text-base"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm sm:text-base">
            <span className="text-xl flex-shrink-0">❌</span>
            <span className="break-words">{error}</span>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm sm:text-base">
            <span className="text-xl flex-shrink-0">✅</span>
            <span className="break-words">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <button
            onClick={() => handleRefreshViews('all')}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm sm:text-base"
          >
            <span className="text-xl">🔄</span>
            <span>Refresh All Views</span>
          </button>
          
          <button
            onClick={() => handleRefreshViews('seo')}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors text-sm sm:text-base"
          >
            <span className="text-xl">🔍</span>
            <span>Refresh SEO Views</span>
          </button>
          
          <button
            onClick={() => handleRefreshViews('analytics')}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors text-sm sm:text-base"
          >
            <span className="text-xl">📊</span>
            <span>Refresh Analytics Views</span>
          </button>
          
          <button
            onClick={handleCheckPartitions}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 bg-indigo-500 text-white px-4 py-3 rounded-lg hover:bg-indigo-600 disabled:opacity-50 transition-colors text-sm sm:text-base"
          >
            <span className="text-xl">🔎</span>
            <span>Check Partitions</span>
          </button>
          
          <button
            onClick={handleCleanupPartitions}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors text-sm sm:text-base"
          >
            <span className="text-xl">🗑️</span>
            <span className="hidden xs:inline">Cleanup Old Partitions</span>
            <span className="xs:hidden">Cleanup</span>
          </button>
          
          <button
            onClick={handleFullMaintenance}
            disabled={isRunning}
            className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors text-sm sm:text-base sm:col-span-2 lg:col-span-1"
          >
            <span className="text-xl">⚙️</span>
            <span>{isRunning ? 'Running...' : 'Full Maintenance'}</span>
          </button>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Maintenance Recommendations ({recommendations.length})
          </h2>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${getPriorityBadge(rec.priority)}`}>
                        {rec.priority.toUpperCase()}
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base break-words">{rec.operation}</span>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 break-words">{rec.reason}</div>
                    {rec.should_run && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        ⚡ Action recommended
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partition Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Partition Status</h2>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium">Total Partitions</div>
            <div className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
              {totalPartitions}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 sm:p-4 rounded-lg border border-green-200 dark:border-green-700">
            <div className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium">Total Size</div>
            <div className="text-2xl sm:text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
              {totalSize.toFixed(0)} MB
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 sm:p-4 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 font-medium">Avg Size</div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
              {totalPartitions > 0 ? (totalSize / totalPartitions).toFixed(1) : 0} MB
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-3 sm:p-4 rounded-lg border border-orange-200 dark:border-orange-700">
            <div className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 font-medium">Total Rows</div>
            <div className="text-2xl sm:text-3xl font-bold text-orange-900 dark:text-orange-100 mt-1">
              {partitions.reduce((sum, p) => sum + p.row_count, 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Partitions Table */}
        {partitions.length > 0 ? (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Partition Name
                      </th>
                      <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Table
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Size (MB)
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Rows
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {partitions.map((partition) => (
                      <tr key={partition.partition_name} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900 dark:text-white break-words">
                          {partition.partition_name}
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {partition.table_name}
                        </td>
                        <td className="px-3 sm:px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                            <span className="text-xs sm:text-sm">{partition.start_date}</span>
                            <span className="hidden sm:inline">→</span>
                            <span className="text-xs sm:text-sm">{partition.end_date}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {partition.size_mb.toFixed(2)}
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {partition.row_count.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            No partitions found
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, Shield, Users, MapPin, Loader2 } from 'lucide-react'

interface SecurityMetrics {
  total_logins_today: number
  total_logins_week: number
  failed_attempts_today: number
  failed_attempts_week: number
  active_sessions: number
  unique_locations_week: number
  trends: {
    logins_trend: number // percentage change from previous period
    failed_attempts_trend: number
  }
}

interface MetricCardProps {
  title: string
  value: number
  trend?: number
  icon: React.ReactNode
  subtitle?: string
}

function MetricCard({ title, value, trend, icon, subtitle }: MetricCardProps) {
  const isPositive = trend !== undefined && trend > 0
  const isNegative = trend !== undefined && trend < 0
  
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
          {icon}
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="mt-4 flex items-center gap-1">
          {isPositive && <TrendingUp className="h-4 w-4 text-green-600" />}
          {isNegative && <TrendingDown className="h-4 w-4 text-red-600" />}
          <span className={`text-sm font-medium ${
            isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500">vs last period</span>
        </div>
      )}
    </div>
  )
}

export function SecurityMetrics() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'7d' | '30d'>('7d')

  const loadMetrics = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/admin/security/metrics?period=${period}`, {
        credentials: 'include',
        signal: AbortSignal.timeout(10000),
      })
      
      if (response.status === 403) {
        throw new Error('Access denied. Admin permissions required.')
      }
      
      if (!response.ok) {
        throw new Error('Failed to load security metrics')
      }
      
      const data = await response.json()
      setMetrics(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMetrics()
  }, [period])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <p className="font-semibold">Error loading metrics</p>
        <p>{error}</p>
        <button
          onClick={loadMetrics}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!metrics) {
    return <div className="p-8 text-center text-gray-500">No metrics available</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Security Overview</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('7d')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              period === '7d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setPeriod('30d')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              period === '30d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Logins Today"
          value={metrics.total_logins_today}
          trend={metrics.trends.logins_trend}
          icon={<Activity className="h-6 w-6" />}
          subtitle={`${metrics.total_logins_week} this week`}
        />
        
        <MetricCard
          title="Failed Attempts"
          value={metrics.failed_attempts_today}
          trend={metrics.trends.failed_attempts_trend}
          icon={<Shield className="h-6 w-6" />}
          subtitle={`${metrics.failed_attempts_week} this week`}
        />
        
        <MetricCard
          title="Active Sessions"
          value={metrics.active_sessions}
          icon={<Users className="h-6 w-6" />}
          subtitle="Currently logged in"
        />
        
        <MetricCard
          title="Unique Locations"
          value={metrics.unique_locations_week}
          icon={<MapPin className="h-6 w-6" />}
          subtitle="Different IPs this week"
        />
      </div>
    </div>
  )
}

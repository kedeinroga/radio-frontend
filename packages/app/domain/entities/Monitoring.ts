/**
 * Monitoring Domain Entities
 * Entities for system health monitoring and alerts
 */

export interface Alert {
  level: 'info' | 'warning' | 'critical'
  category: string
  message: string
  action: string
  resolved: boolean
  timestamp: string
}

export interface DatabaseHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  ping: boolean
  connections: number
  max_connections: number
  usage_percent: number
}

export interface RedisHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  ping: boolean
  memory_mb: number
  usage_percent: number
}

export interface ExternalAPIHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  circuit_breaker: 'closed' | 'open' | 'half-open'
  error_count: number
  last_error: string
  avg_response_time_ms: number
}

export interface PartitionHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  total_partitions: number
  missing_future_partitions: number
  old_partitions_count: number
  last_check: string
}

export interface MaterializedViewHealth {
  status: 'healthy' | 'degraded' | 'unhealthy'
  total_views: number
  stale_views: string[]
  last_refresh: string
  failed_refreshes: number
  avg_refresh_duration_ms: number
}

export interface PerformanceMetrics {
  requests_per_second: number
  avg_response_time_ms: number
  error_rate_percent: number
  cache_hit_rate_percent: number
}

export interface HealthMetrics {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  database: DatabaseHealth
  redis: RedisHealth
  external_api: ExternalAPIHealth
  partitions: PartitionHealth
  materialized_views: MaterializedViewHealth
  performance_metrics: PerformanceMetrics
  alerts: Alert[]
}

export interface HealthResponse {
  success: boolean
  data: HealthMetrics
}

export interface AlertsResponse {
  success: boolean
  data: {
    alerts: Alert[]
    total_alerts: number
    critical_count: number
    warning_count: number
    info_count: number
  }
}

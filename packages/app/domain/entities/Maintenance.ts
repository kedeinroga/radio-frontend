/**
 * Maintenance Domain Entities
 * Entities for database maintenance operations
 */

export interface PartitionInfo {
  partition_name: string
  table_name: string
  start_date: string
  end_date: string
  size_mb: number
  row_count: number
  created_at: string
}

export interface PartitionStatusResponse {
  success: boolean
  data: {
    partitions: PartitionInfo[]
    total_partitions: number
    total_size_mb: number
    oldest_partition: string
    newest_partition: string
  }
}

export interface MaintenanceRecommendation {
  operation: string
  priority: 'info' | 'warning' | 'critical'
  reason: string
  should_run: boolean
  details?: Record<string, any>
}

export interface RecommendationsResponse {
  success: boolean
  data: MaintenanceRecommendation[]
}

export interface RefreshStatsResponse {
  success: boolean
  data: {
    view_name: string
    last_refresh: string
    avg_duration_ms: number
    total_refreshes: number
    failed_refreshes: number
    success_rate_percent: number
  }[]
}

export interface RefreshViewsRequest {
  view_type?: 'seo' | 'analytics' | 'all'
}

export interface RefreshViewsResponse {
  success: boolean
  data: {
    refreshed_views: string[]
    duration_ms: number
    timestamp: string
  }
}

export interface CleanupPartitionsRequest {
  retention_months: number
}

export interface CleanupPartitionsResponse {
  success: boolean
  data: {
    deleted_partitions: string[]
    freed_space_mb: number
    timestamp: string
  }
}

export interface CheckPartitionsResponse {
  success: boolean
  data: {
    missing_partitions: string[]
    months_covered: number
    status: 'ok' | 'warning' | 'error'
    message: string
  }
}

export interface FullMaintenanceResponse {
  success: boolean
  data: {
    views_refreshed: string[]
    partitions_status: string
    recommendations: MaintenanceRecommendation[]
    duration_ms: number
    timestamp: string
  }
}

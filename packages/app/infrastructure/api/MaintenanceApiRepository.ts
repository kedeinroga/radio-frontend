import apiClient from './apiClient'
import type {
  PartitionStatusResponse,
  MaintenanceRecommendation,
  RecommendationsResponse,
  RefreshStatsResponse,
  RefreshViewsRequest,
  RefreshViewsResponse,
  CleanupPartitionsRequest,
  CleanupPartitionsResponse,
  CheckPartitionsResponse,
  FullMaintenanceResponse,
} from '../../domain/entities/Maintenance'

/**
 * Maintenance API Repository
 * Handles database maintenance operations
 * All endpoints require admin authentication
 */
export class MaintenanceApiRepository {
  /**
   * Get partition status with details
   * Returns information about all database partitions
   */
  async getPartitionStatus(): Promise<PartitionStatusResponse> {
    try {
      const response = await apiClient.get('/admin/maintenance/partition-status')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to get partition status')
    }
  }

  /**
   * Get maintenance recommendations
   * Returns list of recommended maintenance operations with priority
   */
  async getRecommendations(): Promise<MaintenanceRecommendation[]> {
    try {
      const response = await apiClient.get<RecommendationsResponse>('/admin/maintenance/recommendations')
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to get maintenance recommendations')
    }
  }

  /**
   * Get refresh statistics for materialized views
   * @param limit - Maximum number of views to return (optional)
   */
  async getRefreshStats(limit?: number): Promise<RefreshStatsResponse> {
    try {
      const params = limit ? { limit } : {}
      const response = await apiClient.get('/admin/maintenance/refresh-stats', { params })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to get refresh statistics')
    }
  }

  /**
   * Refresh materialized views
   * @param request - Optional view type to refresh (seo, analytics, or all)
   */
  async refreshViews(request?: RefreshViewsRequest): Promise<RefreshViewsResponse> {
    try {
      const response = await apiClient.post('/admin/maintenance/refresh-views', request || {})
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to refresh views')
    }
  }

  /**
   * Check if future partitions exist
   * Verifies partitions for upcoming months
   */
  async checkPartitions(): Promise<CheckPartitionsResponse> {
    try {
      const response = await apiClient.get('/admin/maintenance/check-partitions')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to check partitions')
    }
  }

  /**
   * Cleanup old partitions
   * Removes partitions older than specified retention period
   * @param request - Retention configuration (months to keep)
   */
  async cleanupPartitions(request: CleanupPartitionsRequest): Promise<CleanupPartitionsResponse> {
    try {
      const response = await apiClient.post('/admin/maintenance/cleanup-partitions', request)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to cleanup partitions')
    }
  }

  /**
   * Perform full maintenance routine
   * Executes complete maintenance including views refresh, partition checks, and recommendations
   */
  async performFullMaintenance(): Promise<FullMaintenanceResponse> {
    try {
      const response = await apiClient.post('/admin/maintenance/full')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to perform full maintenance')
    }
  }
}

// Export singleton instance
export const maintenanceApiRepository = new MaintenanceApiRepository()

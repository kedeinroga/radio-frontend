import apiClient from './apiClient'
import type {
  HealthMetrics,
  HealthResponse,
  AlertsResponse,
  Alert,
} from '../../domain/entities/Monitoring'

/**
 * Monitoring API Repository
 * Handles system health monitoring and alerts
 * All endpoints require admin authentication
 */
export class MonitoringApiRepository {
  /**
   * Get comprehensive system health metrics
   * Returns health status for all system components
   */
  async getHealthMetrics(): Promise<HealthMetrics> {
    try {
      const response = await apiClient.get<HealthResponse>('/admin/monitoring/health')
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to get health metrics')
    }
  }

  /**
   * Get system alerts
   * Returns list of active alerts based on health checks
   */
  async getAlerts(): Promise<AlertsResponse> {
    try {
      const response = await apiClient.get<AlertsResponse>('/admin/monitoring/alerts')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to get alerts')
    }
  }

  /**
   * Get filtered alerts by severity level
   * @param level - Filter by alert level (info, warning, critical)
   */
  async getAlertsByLevel(level: 'info' | 'warning' | 'critical'): Promise<Alert[]> {
    try {
      const response = await apiClient.get<AlertsResponse>('/admin/monitoring/alerts')
      return response.data.data.alerts.filter(alert => alert.level === level)
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to get alerts by level')
    }
  }

  /**
   * Get critical alerts only
   * Convenience method for filtering critical issues
   */
  async getCriticalAlerts(): Promise<Alert[]> {
    return this.getAlertsByLevel('critical')
  }

  /**
   * Check if system is healthy
   * Returns true if status is 'healthy', false otherwise
   */
  async isSystemHealthy(): Promise<boolean> {
    try {
      const health = await this.getHealthMetrics()
      return health.status === 'healthy'
    } catch (error) {
      return false
    }
  }
}

// Export singleton instance
export const monitoringApiRepository = new MonitoringApiRepository()

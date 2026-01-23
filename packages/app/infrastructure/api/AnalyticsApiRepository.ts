import apiClient from './apiClient'

/**
 * Analytics API Repository
 * Handles analytics operations with backend API (Premium only)
 */

export interface TrendingSearch {
  term: string
  count: number
}

export interface PopularStation {
  station_id: string
  name: string
  play_count: number
}

export interface ActiveUsersCount {
  count: number
  period: string
}

export type TimeRange = 'day' | 'week' | 'month'

export class AnalyticsApiRepository {
  /**
   * Get trending searches (Premium only)
   * @param range Time range: day, week, or month
   * @param limit Maximum number of results
   */
  async getTrendingSearches(range: TimeRange = 'day', limit: number = 10): Promise<TrendingSearch[]> {
    try {
      const response = await apiClient.get('/analytics/searches/trending', {
        params: { range, limit },
      })
      return response.data.data || []
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('You must be logged in to view analytics.')
      }
      if (error.response?.status === 403) {
        throw new Error('This feature is only available for Premium users.')
      }

      throw new Error('Failed to fetch trending searches. Please try again.')
    }
  }

  /**
   * Get popular stations statistics (Premium only)
   * @param range Time range: day, week, or month
   * @param limit Maximum number of results
   */
  async getPopularStations(range: TimeRange = 'day', limit: number = 10): Promise<PopularStation[]> {
    try {
      const response = await apiClient.get('/analytics/stations/popular', {
        params: { range, limit },
      })
      return response.data.data || []
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('You must be logged in to view analytics.')
      }
      if (error.response?.status === 403) {
        throw new Error('This feature is only available for Premium users.')
      }

      throw new Error('Failed to fetch popular stations. Please try again.')
    }
  }

  /**
   * Get active users count (Premium only)
   */
  async getActiveUsers(): Promise<ActiveUsersCount> {
    try {
      const response = await apiClient.get('/analytics/users/active')
      return response.data.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('You must be logged in to view analytics.')
      }
      if (error.response?.status === 403) {
        throw new Error('This feature is only available for Premium users.')
      }

      throw new Error('Failed to fetch active users. Please try again.')
    }
  }
}

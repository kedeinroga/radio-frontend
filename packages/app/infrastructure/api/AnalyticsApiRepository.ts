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
        throw new Error('Debes iniciar sesión para ver analytics.')
      }
      if (error.response?.status === 403) {
        throw new Error('Esta funcionalidad solo está disponible para usuarios Premium.')
      }
      console.error('Error fetching trending searches:', error)
      throw new Error('Error al obtener búsquedas en tendencia. Por favor, intenta de nuevo.')
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
        throw new Error('Debes iniciar sesión para ver analytics.')
      }
      if (error.response?.status === 403) {
        throw new Error('Esta funcionalidad solo está disponible para usuarios Premium.')
      }
      console.error('Error fetching popular stations:', error)
      throw new Error('Error al obtener estaciones populares. Por favor, intenta de nuevo.')
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
        throw new Error('Debes iniciar sesión para ver analytics.')
      }
      if (error.response?.status === 403) {
        throw new Error('Esta funcionalidad solo está disponible para usuarios Premium.')
      }
      console.error('Error fetching active users:', error)
      throw new Error('Error al obtener usuarios activos. Por favor, intenta de nuevo.')
    }
  }
}

import apiClient from './apiClient'

/**
 * Admin API Repository
 * Handles all admin operations
 */
export class AdminApiRepository {
  // ========== ANALYTICS ==========
  
  /**
   * Get active authenticated users count
   * Returns users who have made at least one authenticated request in the last 24 hours
   */
  async getActiveUsers(): Promise<any> {
    const response = await apiClient.get('/analytics/users/active')
    return response.data
  }

  /**
   * Get active guest (unauthenticated) users count
   * Returns unique IP addresses that have accessed the app in the last 24 hours
   */
  async getGuestUsers(): Promise<any> {
    const response = await apiClient.get('/analytics/users/guest')
    return response.data
  }

  /**
   * Get popular stations statistics
   * @param range - Time range: 'hour', 'day', 'week', 'month'
   * @param limit - Maximum number of results (1-100)
   */
  async getPopularStations(range: 'hour' | 'day' | 'week' | 'month' = 'day', limit: number = 10): Promise<any> {
    const response = await apiClient.get('/analytics/stations/popular', {
      params: { range, limit }
    })
    return response.data
  }

  /**
   * Get trending searches
   * @param range - Time range: 'hour', 'day', 'week', 'month'
   * @param limit - Maximum number of results (1-100)
   */
  async getTrendingSearches(range: 'hour' | 'day' | 'week' | 'month' = 'day', limit: number = 10): Promise<any> {
    const response = await apiClient.get('/analytics/searches/trending', {
      params: { range, limit }
    })
    return response.data
  }

  // ========== SEO ==========
  
  /**
   * Refresh SEO statistics
   */
  async refreshSEOStats(): Promise<any> {
    const response = await apiClient.post('/admin/seo/refresh-stats')
    return response.data
  }

  // ========== TRANSLATIONS ==========
  
  /**
   * Get all translations for a station
   */
  async getStationTranslations(stationId: string): Promise<any> {
    const response = await apiClient.get(`/admin/translations/${stationId}`)
    return response.data
  }

  /**
   * Get specific translation
   */
  async getTranslation(stationId: string, lang: string): Promise<any> {
    const response = await apiClient.get(`/admin/translations/${stationId}/${lang}`)
    return response.data
  }

  /**
   * Create a new translation
   */
  async createTranslation(data: {
    station_id: string
    language_code: string
    title: string
    description: string
    keywords?: string[]
  }): Promise<any> {
    const response = await apiClient.post('/admin/translations', data)
    return response.data
  }

  /**
   * Create multiple translations
   */
  async createBulkTranslations(translations: Array<{
    station_id: string
    language_code: string
    title: string
    description: string
    keywords?: string[]
  }>): Promise<any> {
    const response = await apiClient.post('/admin/translations/bulk', translations)
    return response.data
  }

  /**
   * Update a translation
   */
  async updateTranslation(
    stationId: string, 
    lang: string, 
    data: {
      title: string
      description: string
      keywords?: string[]
    }
  ): Promise<any> {
    const response = await apiClient.put(`/admin/translations/${stationId}/${lang}`, data)
    return response.data
  }

  /**
   * Delete a translation
   */
  async deleteTranslation(stationId: string, lang: string): Promise<any> {
    const response = await apiClient.delete(`/admin/translations/${stationId}/${lang}`)
    return response.data
  }
}

export const adminApiRepository = new AdminApiRepository()

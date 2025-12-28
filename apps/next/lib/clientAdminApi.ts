/**
 * Admin API Client for Next.js Client Components
 * Uses fetch to call Next.js API routes that proxy to backend
 * This avoids direct backend calls and uses HttpOnly cookies for auth
 */

const ANALYTICS_BASE = '/api/analytics'
const ADMIN_BASE = '/api/admin'

interface ApiResponse<T = any> {
  data: T
  status: number
}

/**
 * Admin API Repository for Client Components
 * All methods call Next.js API routes which handle authentication via HttpOnly cookies
 */
export class ClientAdminApiRepository {
  // ========== ANALYTICS ==========
  
  /**
   * Get active authenticated users count
   */
  async getActiveUsers(): Promise<ApiResponse> {
    const response = await fetch(`${ANALYTICS_BASE}/users/active`, {
      credentials: 'include',
    })
    
    if (!response.ok) {
      throw new Error(`Failed to get active users: ${response.statusText}`)
    }
    
    const data = await response.json()
    return { data, status: response.status }
  }

  /**
   * Get active guest users count
   */
  async getGuestUsers(): Promise<ApiResponse> {
    const response = await fetch(`${ANALYTICS_BASE}/users/guest`, {
      credentials: 'include',
    })
    
    if (!response.ok) {
      throw new Error(`Failed to get guest users: ${response.statusText}`)
    }
    
    const data = await response.json()
    return { data, status: response.status }
  }

  /**
   * Get popular stations statistics
   */
  async getPopularStations(
    range: 'hour' | 'day' | 'week' | 'month' = 'day',
    limit: number = 10
  ): Promise<ApiResponse> {
    const response = await fetch(
      `${ANALYTICS_BASE}/stations/popular?range=${range}&limit=${limit}`,
      { credentials: 'include' }
    )
    
    if (!response.ok) {
      throw new Error(`Failed to get popular stations: ${response.statusText}`)
    }
    
    const data = await response.json()
    return { data, status: response.status }
  }

  /**
   * Get trending searches
   */
  async getTrendingSearches(
    range: 'hour' | 'day' | 'week' | 'month' = 'day',
    limit: number = 10
  ): Promise<ApiResponse> {
    const response = await fetch(
      `${ANALYTICS_BASE}/searches/trending?range=${range}&limit=${limit}`,
      { credentials: 'include' }
    )
    
    if (!response.ok) {
      throw new Error(`Failed to get trending searches: ${response.statusText}`)
    }
    
    const data = await response.json()
    return { data, status: response.status }
  }

  // ========== SEO ==========
  
  /**
   * Refresh SEO statistics
   */
  async refreshSEOStats(): Promise<ApiResponse> {
    const response = await fetch(`${ADMIN_BASE}/seo/refresh-stats`, {
      method: 'POST',
      credentials: 'include',
    })
    
    if (!response.ok) {
      throw new Error(`Failed to refresh SEO stats: ${response.statusText}`)
    }
    
    const data = await response.json()
    return { data, status: response.status }
  }

  // ========== TRANSLATIONS ==========
  
  /**
   * Get all translations for a station
   */
  async getStationTranslations(stationId: string): Promise<ApiResponse> {
    const response = await fetch(`${ADMIN_BASE}/translations/${stationId}`, {
      credentials: 'include',
    })
    
    if (!response.ok) {
      throw new Error(`Failed to get station translations: ${response.statusText}`)
    }
    
    const data = await response.json()
    return { data, status: response.status }
  }

  /**
   * Get specific translation
   */
  async getTranslation(stationId: string, lang: string): Promise<ApiResponse> {
    const response = await fetch(`${ADMIN_BASE}/translations/${stationId}/${lang}`, {
      credentials: 'include',
    })
    
    if (!response.ok) {
      throw new Error(`Failed to get translation: ${response.statusText}`)
    }
    
    const data = await response.json()
    return { data, status: response.status }
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
  }): Promise<ApiResponse> {
    const response = await fetch(`${ADMIN_BASE}/translations`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to create translation: ${response.statusText}`)
    }
    
    const result = await response.json()
    return { data: result, status: response.status }
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
  }>): Promise<ApiResponse> {
    const response = await fetch(`${ADMIN_BASE}/translations/bulk`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(translations),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to create bulk translations: ${response.statusText}`)
    }
    
    const result = await response.json()
    return { data: result, status: response.status }
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
  ): Promise<ApiResponse> {
    const response = await fetch(`${ADMIN_BASE}/translations/${stationId}/${lang}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update translation: ${response.statusText}`)
    }
    
    const result = await response.json()
    return { data: result, status: response.status }
  }

  /**
   * Delete a translation
   */
  async deleteTranslation(stationId: string, lang: string): Promise<ApiResponse> {
    const response = await fetch(`${ADMIN_BASE}/translations/${stationId}/${lang}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    
    if (!response.ok) {
      throw new Error(`Failed to delete translation: ${response.statusText}`)
    }
    
    const result = await response.json()
    return { data: result, status: response.status }
  }
}

// Export singleton instance
export const clientAdminApi = new ClientAdminApiRepository()

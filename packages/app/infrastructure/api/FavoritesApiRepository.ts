import apiClient from './apiClient'
import { Station } from '../../domain/entities/Station'

/**
 * Favorites API Repository
 * Handles favorite stations operations with backend API
 */
export class FavoritesApiRepository {
  /**
   * Get all favorite stations for the authenticated user
   */
  async getFavorites(): Promise<Station[]> {
    try {
      const response = await apiClient.get('/favorites')
      return (response.data.data || []).map((item: any) => this.mapToStation(item))
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('You must be logged in to view your favorites.')
      }

      throw new Error('Failed to fetch favorites. Please try again.')
    }
  }

  /**
   * Add a station to favorites
   */
  async addFavorite(stationId: string): Promise<void> {
    try {
      await apiClient.post('/favorites', { station_id: stationId })
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('You must be logged in to add favorites.')
      }
      if (error.response?.status === 403) {
        throw new Error('This station is only available for Premium users.')
      }
      if (error.response?.status === 404) {
        throw new Error('Station not found.')
      }
      if (error.response?.status === 409) {
        // Station already in favorites - not really an error
        return
      }

      throw new Error('Failed to add favorite. Please try again.')
    }
  }

  /**
   * Remove a station from favorites
   */
  async removeFavorite(stationId: string): Promise<void> {
    try {
      await apiClient.delete(`/favorites/${stationId}`)
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('You must be logged in to remove favorites.')
      }
      if (error.response?.status === 404) {
        // Favorite not found - not really an error, it's already removed
        return
      }

      throw new Error('Failed to remove favorite. Please try again.')
    }
  }

  private mapToStation(data: any): Station {
    return new Station(
      data.id,
      data.name,
      data.stream_url,
      data.image_url,
      data.country,
      data.genre,
      data.is_premium || false,
      data.description,
      data.bitrate
    )
  }
}

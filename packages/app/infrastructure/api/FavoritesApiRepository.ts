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
        throw new Error('Debes iniciar sesión para ver tus favoritos.')
      }
      console.error('Error fetching favorites:', error)
      throw new Error('Error al obtener favoritos. Por favor, intenta de nuevo.')
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
        throw new Error('Debes iniciar sesión para agregar favoritos.')
      }
      if (error.response?.status === 403) {
        throw new Error('Esta estación solo está disponible para usuarios Premium.')
      }
      if (error.response?.status === 404) {
        throw new Error('Estación no encontrada.')
      }
      if (error.response?.status === 409) {
        // Station already in favorites - not really an error
        return
      }
      console.error('Error adding favorite:', error)
      throw new Error('Error al agregar favorito. Por favor, intenta de nuevo.')
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
        throw new Error('Debes iniciar sesión para eliminar favoritos.')
      }
      if (error.response?.status === 404) {
        // Favorite not found - not really an error, it's already removed
        return
      }
      console.error('Error removing favorite:', error)
      throw new Error('Error al eliminar favorito. Por favor, intenta de nuevo.')
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

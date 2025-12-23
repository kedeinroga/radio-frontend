import apiClient from '../api/apiClient'
import { IStationRepository } from '../../domain/repositories/IStationRepository'
import { Station } from '../../domain/entities/Station'

/**
 * Station API Repository
 * Implements IStationRepository using backend API
 */
export class StationApiRepository implements IStationRepository {
  async findById(id: string): Promise<Station | null> {
    try {
      const response = await apiClient.get(`/stations/${id}`)
      // Backend returns { data: {...}, meta: {...} }
      if (response.data.data) {
        return this.mapToStation(response.data.data)
      }
      return null
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      if (error.response?.status === 403) {
        throw new Error('Esta estación solo está disponible para usuarios Premium.')
      }
      if (error.response?.status === 503) {
        throw new Error('El servicio de estaciones está temporalmente no disponible. Por favor, intenta más tarde.')
      }
      console.error('Error fetching station by ID:', error)
      throw new Error('Error al obtener la estación. Por favor, intenta de nuevo.')
    }
  }

  async search(query: string, limit: number = 20): Promise<Station[]> {
    try {
      const response = await apiClient.get('/stations/search', {
        params: { q: query, limit },
        timeout: 60000, // Extended timeout for searches (60 seconds)
      })
      return (response.data.data || []).map((item: any) => this.mapToStation(item))
    } catch (error: any) {
      // Handle specific HTTP errors from backend
      if (error.response?.status === 400) {
        throw new Error('Por favor, proporciona un término de búsqueda válido.')
      }
      if (error.response?.status === 503) {
        throw new Error('El servicio de búsqueda está temporalmente no disponible. Por favor, intenta más tarde.')
      }
      // Handle timeout errors
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        console.error('Search timeout - backend is taking too long:', error)
        throw new Error('La búsqueda está tardando más de lo esperado. Por favor, intenta con términos más específicos.')
      }
      console.error('Error searching stations:', error)
      throw new Error('Error al buscar estaciones. Por favor, intenta de nuevo.')
    }
  }

  async getPopular(limit: number = 20, country?: string): Promise<Station[]> {
    try {
      const params: any = { limit }
      if (country) {
        params.country = country
      }
      const response = await apiClient.get('/stations/popular', { params })
      // Backend returns { data: [...], meta: {...} }
      return (response.data.data || []).map((item: any) => this.mapToStation(item))
    } catch (error: any) {
      if (error.response?.status === 503) {
        throw new Error('El servicio de estaciones está temporalmente no disponible. Por favor, intenta más tarde.')
      }
      console.error('Error fetching popular stations:', error)
      throw new Error('Error al obtener estaciones populares. Por favor, intenta de nuevo.')
    }
  }

  async getByGenre(genre: string, limit: number = 20): Promise<Station[]> {
    // Use search with genre as query
    return this.search(genre, limit)
  }

  async getByCountry(country: string, limit: number = 20): Promise<Station[]> {
    // Use getPopular with country filter
    return this.getPopular(limit, country)
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

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
      console.error('Error fetching station by ID:', error)
      throw error
    }
  }

  async search(query: string, limit: number = 20): Promise<Station[]> {
    try {
      const response = await apiClient.get('/stations/search', {
        params: { q: query, limit },
      })
      return (response.data.data || []).map((item: any) => this.mapToStation(item))
    } catch (error) {
      console.error('Error searching stations:', error)
      return []
    }
  }

  async getPopular(limit: number = 20): Promise<Station[]> {
    try {
      const response = await apiClient.get('/stations/popular', {
        params: { limit },
      })
      // Backend returns { data: [...], meta: {...} }
      return (response.data.data || []).map((item: any) => this.mapToStation(item))
    } catch (error) {
      console.error('Error fetching popular stations:', error)
      return []
    }
  }

  async getByGenre(genre: string, limit: number = 20): Promise<Station[]> {
    // Use search with genre as query
    return this.search(genre, limit)
  }

  async getByCountry(country: string, limit: number = 20): Promise<Station[]> {
    try {
      const response = await apiClient.get('/stations/popular', {
        params: { country, limit },
      })
      return (response.data.data || []).map((item: any) => this.mapToStation(item))
    } catch (error) {
      console.error('Error fetching stations by country:', error)
      return []
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

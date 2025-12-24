import apiClient from '../api/apiClient'
import { IStationRepository } from '../../domain/repositories/IStationRepository'
import { Station, SEOMetadata } from '../../domain/entities/Station'

/**
 * Station API Repository
 * Implements IStationRepository using backend API
 */
export class StationApiRepository implements IStationRepository {
  // In-memory cache for slug -> ID mapping
  private slugToIdCache = new Map<string, string>()
  
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

  /**
   * Finds a station by slug or ID
   * Strategy: 
   * 1. Check if input looks like UUID -> use findById
   * 2. Check cache for slug -> ID mapping
   * 3. Search popular stations and find by slug
   * 4. Cache the slug -> ID mapping for future use
   */
  async findBySlug(slug: string): Promise<Station | null> {
    // Check if it's already an ID (UUID format)
    if (this.isUUID(slug)) {
      return this.findById(slug)
    }

    // Check cache first
    const cachedId = this.slugToIdCache.get(slug)
    if (cachedId) {
      return this.findById(cachedId)
    }

    // Search in popular stations and search results
    try {
      // Try popular stations first (most likely to contain the slug)
      const popularStations = await this.getPopular(100)
      const station = popularStations.find(s => s.slug === slug)
      
      if (station) {
        // Cache the mapping
        this.slugToIdCache.set(slug, station.id)
        return station
      }

      // If not found in popular, try searching by name
      const searchResults = await this.search(slug.replace(/-/g, ' '), 50)
      const searchStation = searchResults.find(s => s.slug === slug)
      
      if (searchStation) {
        this.slugToIdCache.set(slug, searchStation.id)
        return searchStation
      }

      return null
    } catch (error) {
      console.error('Error finding station by slug:', error)
      return null
    }
  }

  /**
   * Finds station by slug or ID (flexible)
   */
  async findBySlugOrId(slugOrId: string): Promise<Station | null> {
    if (this.isUUID(slugOrId)) {
      return this.findById(slugOrId)
    }
    return this.findBySlug(slugOrId)
  }

  /**
   * Checks if string is a valid UUID
   */
  private isUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }

  private mapToStation(data: any): Station {
    // Map SEO metadata if present
    const seoMetadata: SEOMetadata | undefined = data.seo_metadata ? {
      title: data.seo_metadata.title || '',
      description: data.seo_metadata.description || '',
      keywords: data.seo_metadata.keywords || [],
      canonicalUrl: data.seo_metadata.canonical_url || '',
      imageUrl: data.seo_metadata.image_url || '',
      alternateNames: data.seo_metadata.alternate_names || [],
      lastModified: data.seo_metadata.last_modified || new Date().toISOString()
    } : undefined

    return new Station(
      data.id,
      data.name,
      data.stream_url,
      data.slug || this.generateSlug(data.name), // Fallback if backend doesn't provide slug
      data.tags || [],
      seoMetadata,
      data.image_url,
      data.country,
      data.genre,
      data.is_premium_only || false,
      data.description,
      data.bitrate,
      data.votes
    )
  }

  /**
   * Generates a slug from station name (fallback)
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')     // Replace spaces/special chars with -
      .replace(/(^-|-$)/g, '')         // Remove leading/trailing -
  }
}

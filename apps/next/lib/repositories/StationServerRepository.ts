import type { IStationRepository } from '@radio-app/app'
import { Station } from '@radio-app/app'
import type { SEOMetadata } from '@radio-app/app'
import { backendHttpClient, BackendError } from '@/lib/api/backendClient'


/**
 * Station Server Repository
 *
 * Implementación de IStationRepository para uso EXCLUSIVO en SSR (apps/next).
 *
 * ✅ Usa backendHttpClient → envía X-Rradio-Secret automáticamente
 * ✅ La clave secreta nunca sale del servidor
 * ✅ Implementa la misma interfaz que StationApiRepository (intercambiable)
 * ❌ NUNCA importar en componentes del cliente
 */
export class StationServerRepository implements IStationRepository {
  // In-memory cache for slug -> ID mapping (per request, no cross-request state)
  private slugToIdCache = new Map<string, string>()

  async findById(id: string): Promise<Station | null> {
    try {
      const data = await backendHttpClient.get<{ data: any; seo_metadata?: any }>(
        `/stations/${id}`
      )
      if (data.data) {
        return this.mapToStation({ ...data.data, seo_metadata: data.seo_metadata })
      }
      return null
    } catch (error) {
      if (error instanceof BackendError) {
        if (error.status === 404) return null
        if (error.status === 403) throw new Error('This station is only available for Premium users.')
        if (error.isUnauthorized) throw new Error('Service temporarily unavailable. Please try again later.')
        if (error.isServerError) throw new Error('The stations service is experiencing issues. Please try again later.')
      }
      throw new Error('Failed to fetch station. Please try again.')
    }
  }

  async search(query: string, limit: number = 20): Promise<Station[]> {
    try {
      const data = await backendHttpClient.get<{ data: any[] }>(
        `/stations/search?q=${encodeURIComponent(query)}&limit=${limit}`
      )
      return (data.data || []).map((item) => this.mapToStation(item))
    } catch (error) {
      if (error instanceof BackendError) {
        if (error.status === 400) throw new Error('Please provide a valid search term.')
        if (error.isUnauthorized) throw new Error('Service temporarily unavailable. Please try again later.')
        if (error.isServerError) throw new Error('The search service is temporarily unavailable. Please try again later.')
      }
      throw new Error('Failed to search stations. Please try again.')
    }
  }

  async getPopular(limit: number = 20, country?: string): Promise<Station[]> {
    try {
      let endpoint = `/stations/popular?limit=${limit}`
      if (country) endpoint += `&country=${encodeURIComponent(country)}`

      const data = await backendHttpClient.get<{ data: any[] }>(endpoint)
      return (data.data || []).map((item) => this.mapToStation(item))
    } catch (error) {
      if (error instanceof BackendError) {
        if (error.isUnauthorized) {
          console.error('[StationServerRepository] ❌ 401 — verifica API_SECRET_KEY en el entorno.')
          throw new Error('Service temporarily unavailable. Please try again later.')
        }
        if (error.isServerError) {
          throw new Error('The stations service is temporarily unavailable. Please try again later.')
        }
      }
      throw new Error('Failed to fetch popular stations. Please try again.')
    }
  }

  async getByGenre(genre: string, limit: number = 20): Promise<Station[]> {
    return this.search(genre, limit)
  }

  async getByCountry(country: string, limit: number = 20): Promise<Station[]> {
    return this.search(country, limit)
  }

  async findBySlug(slug: string): Promise<Station | null> {
    if (this.isUUID(slug)) return this.findById(slug)

    const cachedId = this.slugToIdCache.get(slug)
    if (cachedId) return this.findById(cachedId)

    try {
      const popularStations = await this.getPopular(100)
      const station = popularStations.find((s) => s.slug === slug)
      if (station) {
        this.slugToIdCache.set(slug, station.id)
        return station
      }

      const searchResults = await this.search(slug.replace(/-/g, ' '), 50)
      const searchStation = searchResults.find((s) => s.slug === slug)
      if (searchStation) {
        this.slugToIdCache.set(slug, searchStation.id)
        return searchStation
      }

      return null
    } catch {
      return null
    }
  }

  async findBySlugOrId(slugOrId: string): Promise<Station | null> {
    if (this.isUUID(slugOrId)) return this.findById(slugOrId)
    return this.findBySlug(slugOrId)
  }

  private isUUID(str: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
  }

  private mapToStation(data: any): Station {
    const seoMetadata: SEOMetadata | undefined = data.seo_metadata
      ? {
        title: data.seo_metadata.title || '',
        description: data.seo_metadata.description || '',
        keywords: data.seo_metadata.keywords || [],
        canonicalUrl: data.seo_metadata.canonical_url || '',
        imageUrl: data.seo_metadata.image_url || '',
        alternateNames: data.seo_metadata.alternate_names || [],
        lastModified: data.seo_metadata.last_modified || new Date().toISOString(),
      }
      : undefined

    return new Station(
      data.id,
      data.name,
      data.stream_url,
      data.slug || this.generateSlug(data.name),
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

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
}

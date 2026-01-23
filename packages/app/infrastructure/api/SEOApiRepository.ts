import apiClient from './apiClient'
import { ISEORepository } from '../../domain/repositories/ISEORepository'
import { PopularCountry } from '../../domain/entities/PopularCountry'
import { PopularTag } from '../../domain/entities/PopularTag'
import { SitemapData } from '../../domain/entities/SitemapData'

/**
 * SEO API Repository
 * Implements ISEORepository using backend SEO endpoints
 */
export class SEOApiRepository implements ISEORepository {
  async getPopularCountries(limit: number = 50): Promise<PopularCountry[]> {
    try {
      const response = await apiClient.get('/seo/popular-countries', {
        params: { limit: Math.min(limit, 50) } // Backend max is 50
      })
      
      const countries = response.data.data?.countries || []
      return countries.map((item: any) =>
        new PopularCountry(
          item.country_code,
          item.country_name,
          item.station_count
        )
      )
    } catch (error: any) {

      // Return empty array instead of throwing to prevent sitemap generation failure
      return []
    }
  }

  async getPopularTags(limit: number = 100): Promise<PopularTag[]> {
    try {
      const response = await apiClient.get('/seo/popular-tags', {
        params: { limit: Math.min(limit, 100) } // Backend max is 100
      })
      
      const tags = response.data.data?.tags || []
      return tags
        .filter((item: any) => item.tag && item.tag.trim() !== '') // Filter out empty tags
        .map((item: any) =>
          new PopularTag(
            item.tag,
            item.normalized_tag || item.tag.toLowerCase().replace(/\s+/g, '-'), // Fallback normalized tag
            item.station_count || 0
          )
        )
    } catch (error: any) {

      return []
    }
  }

  async getSitemapData(): Promise<SitemapData> {
    try {
      const response = await apiClient.get('/seo/sitemap-data')
      const data = response.data.data

      const countries = (data.popular_countries || []).map((c: any) =>
        new PopularCountry(c.country_code, c.country_name, c.station_count)
      )

      const tags = (data.popular_tags || []).map((t: any) =>
        new PopularTag(t.tag, t.normalized_tag, t.station_count)
      )

      return new SitemapData(
        countries,
        tags,
        data.total_stations || 0,
        data.last_updated || new Date().toISOString()
      )
    } catch (error: any) {

      // Return minimal sitemap data to prevent complete failure
      return new SitemapData([], [], 0, new Date().toISOString())
    }
  }
}

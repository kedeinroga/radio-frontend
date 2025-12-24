import { PopularCountry } from '../entities/PopularCountry'
import { PopularTag } from '../entities/PopularTag'
import { SitemapData } from '../entities/SitemapData'

/**
 * SEO Repository Interface
 * Handles SEO-related data fetching operations
 */
export interface ISEORepository {
  /**
   * Fetches popular countries with station counts
   * @param limit Maximum number of countries to return (default: 50, max: 50)
   */
  getPopularCountries(limit?: number): Promise<PopularCountry[]>

  /**
   * Fetches popular tags/genres with station counts
   * @param limit Maximum number of tags to return (default: 100, max: 100)
   */
  getPopularTags(limit?: number): Promise<PopularTag[]>

  /**
   * Fetches aggregated sitemap data (countries + tags)
   * Cached for 6 hours on backend
   */
  getSitemapData(): Promise<SitemapData>
}

import { PopularCountry } from './PopularCountry'
import { PopularTag } from './PopularTag'

/**
 * Sitemap Data Entity
 * Aggregated data for generating dynamic sitemap.xml
 */
export class SitemapData {
  constructor(
    public readonly popularCountries: PopularCountry[],
    public readonly popularTags: PopularTag[],
    public readonly totalStations: number,
    public readonly lastUpdated: string  // ISO 8601 timestamp
  ) {
    this.validate()
  }

  private validate(): void {
    if (this.totalStations < 0) {
      throw new Error('Total stations must be non-negative')
    }
    if (!this.lastUpdated) {
      throw new Error('Last updated timestamp is required')
    }
  }

  /**
   * Returns last updated as Date object
   */
  get lastUpdatedDate(): Date {
    return new Date(this.lastUpdated)
  }

  /**
   * Returns total unique URLs for sitemap
   */
  get totalUrls(): number {
    return this.popularCountries.length + this.popularTags.length + 2 // +2 for home and search
  }
}

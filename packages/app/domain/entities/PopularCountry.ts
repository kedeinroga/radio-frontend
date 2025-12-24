/**
 * Popular Country Entity
 * Represents a country with station count for SEO/sitemap generation
 */
export class PopularCountry {
  constructor(
    public readonly countryCode: string,    // ISO country code (e.g., "US")
    public readonly countryName: string,    // Full country name (e.g., "United States")
    public readonly stationCount: number    // Number of active stations
  ) {
    this.validate()
  }

  private validate(): void {
    if (!this.countryCode || this.countryCode.trim() === '') {
      throw new Error('Country code is required')
    }
    if (!this.countryName || this.countryName.trim() === '') {
      throw new Error('Country name is required')
    }
    if (this.stationCount < 0) {
      throw new Error('Station count must be non-negative')
    }
  }

  /**
   * Generates SEO-friendly URL slug
   */
  get urlSlug(): string {
    return this.countryCode.toLowerCase()
  }
}

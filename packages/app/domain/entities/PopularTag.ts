/**
 * Popular Tag Entity
 * Represents a genre/tag with station count for SEO/sitemap generation
 */
export class PopularTag {
  constructor(
    public readonly tag: string,              // Original tag name
    public readonly normalizedTag: string,    // Normalized/slugified tag
    public readonly stationCount: number      // Number of stations with this tag
  ) {
    this.validate()
  }

  private validate(): void {
    if (!this.tag || this.tag.trim() === '') {
      throw new Error('Tag is required')
    }
    if (!this.normalizedTag || this.normalizedTag.trim() === '') {
      throw new Error('Normalized tag is required')
    }
    if (this.stationCount < 0) {
      throw new Error('Station count must be non-negative')
    }
  }

  /**
   * Returns URL-safe tag slug
   */
  get urlSlug(): string {
    return this.normalizedTag.toLowerCase()
  }

  /**
   * Returns display name (capitalized)
   */
  get displayName(): string {
    return this.tag.charAt(0).toUpperCase() + this.tag.slice(1)
  }
}

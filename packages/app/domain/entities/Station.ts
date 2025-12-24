/**
 * Station Entity
 * Represents a radio station in the domain
 */

// Import SEOMetadata type
export interface SEOMetadata {
  title: string
  description: string
  keywords: string[]
  canonicalUrl: string
  imageUrl: string
  alternateNames: string[]
  lastModified: string
}

export class Station {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly streamUrl: string,
    public readonly slug: string,              // SEO-friendly URL slug
    public readonly tags: string[] = [],       // Tags for categorization and related stations
    public readonly seoMetadata?: SEOMetadata, // Rich SEO metadata from backend
    public readonly imageUrl?: string,
    public readonly country?: string,
    public readonly genre?: string,            // Deprecated - use tags[0] instead
    public readonly isPremium: boolean = false,
    public readonly description?: string,
    public readonly bitrate?: number,
    public readonly votes?: number             // Station popularity/votes
  ) {
    this.validate()
  }

  private validate(): void {
    if (!this.id || this.id.trim() === '') {
      throw new Error('Station ID is required')
    }
    if (!this.name || this.name.trim() === '') {
      throw new Error('Station name is required')
    }
    if (!this.isValidStreamUrl(this.streamUrl)) {
      throw new Error('Invalid stream URL')
    }
  }

  private isValidStreamUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url)
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
    } catch {
      return false
    }
  }

  /**
   * Returns display name (uppercase for UI consistency)
   */
  get displayName(): string {
    return this.name
  }

  /**
   * Returns formatted genre and country for display
   */
  get metadata(): string {
    const parts = []
    if (this.genre) parts.push(this.genre)
    if (this.country) parts.push(this.country)
    return parts.join(' • ')
  }

  /**
   * Checks if station requires premium access
   */
  get requiresPremium(): boolean {
    return this.isPremium
  }

  /**
   * Returns top 3 related tags for finding similar stations
   */
  getRelatedTags(): string[] {
    return this.tags.slice(0, 3)
  }

  /**
   * Generates canonical URL for SEO
   */
  getCanonicalUrl(baseUrl: string): string {
    return `${baseUrl}/radio/${this.slug}`
  }

  /**
   * Returns the primary genre/tag
   */
  get primaryGenre(): string | undefined {
    return this.tags[0] || this.genre
  }

  /**
   * Serializes the Station to a plain object for Client Components
   * Required for Next.js Server -> Client Component communication
   */
  toJSON(): StationDTO {
    return {
      id: this.id,
      name: this.name,
      streamUrl: this.streamUrl,
      slug: this.slug,
      tags: this.tags,
      seoMetadata: this.seoMetadata,
      imageUrl: this.imageUrl,
      country: this.country,
      genre: this.genre,
      isPremium: this.isPremium,
      description: this.description,
      bitrate: this.bitrate,
      votes: this.votes,
      // Include computed properties
      primaryGenre: this.primaryGenre,
      displayName: this.displayName,
      metadata: this.metadata
    }
  }
}

/**
 * Plain DTO for passing Station data to Client Components
 */
export interface StationDTO {
  id: string
  name: string
  streamUrl: string
  slug: string
  tags: string[]
  seoMetadata?: SEOMetadata
  imageUrl?: string
  country?: string
  genre?: string
  isPremium: boolean
  description?: string
  bitrate?: number
  votes?: number
  // Computed properties
  primaryGenre?: string
  displayName: string
  metadata: string
}

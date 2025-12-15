/**
 * Station Entity
 * Represents a radio station in the domain
 */
export class Station {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly streamUrl: string,
    public readonly imageUrl?: string,
    public readonly country?: string,
    public readonly genre?: string,
    public readonly isPremium: boolean = false,
    public readonly description?: string,
    public readonly bitrate?: number
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
}

/**
 * User Entity
 * Represents a user in the domain
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name: string,
    public readonly role: 'guest' | 'premium' | 'admin' = 'guest',
    public readonly avatarUrl?: string,
    public readonly favoriteStationIds: string[] = []
  ) {
    this.validate()
  }

  private validate(): void {
    if (!this.id || this.id.trim() === '') {
      throw new Error('User ID is required')
    }
    if (!this.email || !this.isValidEmail(this.email)) {
      throw new Error('Valid email is required')
    }
    if (!this.name || this.name.trim() === '') {
      throw new Error('User name is required')
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Checks if user has premium access
   */
  get isPremium(): boolean {
    return this.role === 'premium'
  }

  /**
   * Checks if user is a guest
   */
  get isGuest(): boolean {
    return this.role === 'guest'
  }

  /**
   * Checks if user is an admin
   */
  get isAdmin(): boolean {
    return this.role === 'admin'
  }

  /**
   * Returns user initials for avatar fallback
   */
  get initials(): string {
    return this.name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  /**
   * Adds a station to favorites (immutable)
   */
  addFavorite(stationId: string): User {
    if (this.favoriteStationIds.includes(stationId)) {
      return this
    }
    return new User(
      this.id,
      this.email,
      this.name,
      this.role,
      this.avatarUrl,
      [...this.favoriteStationIds, stationId]
    )
  }

  /**
   * Removes a station from favorites (immutable)
   */
  removeFavorite(stationId: string): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.role,
      this.avatarUrl,
      this.favoriteStationIds.filter((id) => id !== stationId)
    )
  }

  /**
   * Checks if a station is in favorites
   */
  hasFavorite(stationId: string): boolean {
    return this.favoriteStationIds.includes(stationId)
  }
}

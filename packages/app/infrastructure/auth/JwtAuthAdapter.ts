import apiClient, { initializeApiClient } from '../api/apiClient'
import { IUserRepository } from '../../domain/repositories/IUserRepository'
import { ISecureStorage } from '../storage/ISecureStorage'
import { User } from '../../domain/entities/User'
import { Station } from '../../domain/entities/Station'
import { AuthenticationError } from '../../domain/errors/DomainErrors'

/**
 * JWT Authentication Adapter
 * Implements IUserRepository using JWT backend API
 */
export class JwtAuthAdapter implements IUserRepository {
  private accessToken: string | null = null
  private refreshTokenValue: string | null = null

  constructor(private storage: ISecureStorage) {
    this.initializeTokens()
  }

  private async initializeTokens(): Promise<void> {
    this.accessToken = await this.storage.getItem('access_token')
    this.refreshTokenValue = await this.storage.getItem('refresh_token')

    // Initialize API client with token storage
    initializeApiClient({
      getAccessToken: async () => this.accessToken,
      getRefreshToken: async () => this.refreshTokenValue,
      setAccessToken: async (token: string) => {
        this.accessToken = token
        await this.storage.setItem('access_token', token)
      },
      clearTokens: async () => {
        this.accessToken = null
        this.refreshTokenValue = null
        await this.storage.removeItem('access_token')
        await this.storage.removeItem('refresh_token')
      },
    })
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.accessToken) {
      return null
    }

    try {
      const response = await apiClient.get('/auth/me')
      return this.mapToUser(response.data)
    } catch (error) {
      // Token might be expired, will be handled by interceptor
      return null
    }
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      })

      const { access_token, refresh_token, user } = response.data

      await this.saveTokens(access_token, refresh_token)

      return this.mapToUser(user)
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new AuthenticationError('Invalid email or password')
      }
      throw new AuthenticationError('Login failed. Please try again.')
    }
  }

  async register(email: string, password: string): Promise<User> {
    try {
      const response = await apiClient.post('/auth/register', {
        email,
        password,
      })

      const { access_token, refresh_token, user } = response.data

      await this.saveTokens(access_token, refresh_token)

      return this.mapToUser(user)
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new AuthenticationError('Invalid email or password format')
      }
      throw new AuthenticationError('Registration failed. Please try again.')
    }
  }

  async logout(): Promise<void> {
    await this.storage.removeItem('access_token')
    await this.storage.removeItem('refresh_token')
    this.accessToken = null
    this.refreshTokenValue = null
  }

  async refreshToken(): Promise<string> {
    if (!this.refreshTokenValue) {
      throw new AuthenticationError('No refresh token available')
    }

    const response = await apiClient.post('/auth/refresh', {
      refresh_token: this.refreshTokenValue,
    })

    const { access_token } = response.data
    await this.saveTokens(access_token, this.refreshTokenValue)

    return access_token
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    // TODO: Implement when backend endpoint is available
    throw new Error('Not implemented')
  }

  async getFavorites(): Promise<Station[]> {
    try {
      const response = await apiClient.get('/favorites')
      return response.data.favorites.map((fav: any) => this.mapToStation(fav.station))
    } catch (error) {
      return []
    }
  }

  async addFavorite(stationId: string): Promise<void> {
    await apiClient.post('/favorites', {
      station_id: stationId,
    })
  }

  async removeFavorite(stationId: string): Promise<void> {
    await apiClient.delete(`/favorites/${stationId}`)
  }

  private async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    this.accessToken = accessToken
    this.refreshTokenValue = refreshToken
    await this.storage.setItem('access_token', accessToken)
    await this.storage.setItem('refresh_token', refreshToken)
  }

  private mapToUser(data: any): User {
    return new User(
      data.id,
      data.email,
      data.name || data.email.split('@')[0],
      data.role || 'guest',
      data.avatar_url,
      data.favorite_station_ids || []
    )
  }

  private mapToStation(data: any): Station {
    return new Station(
      data.id,
      data.name,
      data.stream_url,
      data.image_url,
      data.country,
      data.genre,
      data.is_premium || false,
      data.description,
      data.bitrate
    )
  }
}

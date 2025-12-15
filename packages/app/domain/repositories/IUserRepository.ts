import { User } from '../entities/User'
import { Station } from '../entities/Station'

/**
 * User Repository Interface
 * Defines operations for user data and authentication
 */
export interface IUserRepository {
  /**
   * Get current authenticated user
   */
  getCurrentUser(): Promise<User | null>

  /**
   * Login with email and password
   */
  login(email: string, password: string): Promise<User>

  /**
   * Register new user
   */
  register(email: string, password: string): Promise<User>

  /**
   * Logout current user
   */
  logout(): Promise<void>

  /**
   * Refresh authentication token
   */
  refreshToken(): Promise<string>

  /**
   * Update user profile
   */
  updateProfile(userId: string, data: Partial<User>): Promise<User>

  /**
   * Get user's favorite stations
   */
  getFavorites(): Promise<Station[]>

  /**
   * Add station to favorites
   */
  addFavorite(stationId: string): Promise<void>

  /**
   * Remove station from favorites
   */
  removeFavorite(stationId: string): Promise<void>
}

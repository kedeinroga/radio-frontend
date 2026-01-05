import apiClient from './apiClient'
import type {
  GetSessionsResponse,
  RevokeTokenRequest,
  RevokeTokenResponse,
  ValidateTokenRequest,
  ValidateTokenResponse,
  LogoutResponse,
} from '../../domain/entities/Session'

/**
 * Authentication API Repository
 * Handles user authentication operations with backend API
 */

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
}

export interface RefreshRequest {
  refresh_token: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface UserInfo {
  id: string
  email: string
  role: string
  is_premium: boolean
  created_at: string
}

export class AuthApiRepository {
  /**
   * Register a new user account (guest role by default)
   */
  async register(request: RegisterRequest): Promise<AuthTokens> {
    try {
      const response = await apiClient.post('/auth/register', request)
      return response.data.data
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Invalid registration data. Check your email and password.')
      }
      console.error('Error registering user:', error)
      throw new Error('Failed to register user. Please try again.')
    }
  }

  /**
   * Login with email and password
   */
  async login(request: LoginRequest): Promise<AuthTokens> {
    try {
      const response = await apiClient.post('/auth/login', request)
      
      // Backend returns tokens directly: { access_token, refresh_token, token_type }
      const data = response.data
      
      if (!data.access_token || !data.refresh_token) {
        throw new Error('Invalid authentication response from server')
      }
      
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: data.token_type || 'Bearer',
        expires_in: data.expires_in || 3600
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Invalid login credentials.')
      }
      if (error.response?.status === 401) {
        throw new Error('Incorrect email or password.')
      }
      throw new Error(error.message || 'Failed to log in. Please try again.')
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(request: RefreshRequest): Promise<{ access_token: string }> {
    try {
      const response = await apiClient.post('/auth/refresh', request)
      return response.data.data
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Invalid refresh token.')
      }
      if (error.response?.status === 401) {
        throw new Error('Refresh token expired or invalid. Please log in again.')
      }
      console.error('Error refreshing token:', error)
      throw new Error('Failed to refresh token. Please try again.')
    }
  }

  /**
   * Get current authenticated user information
   */
  async getCurrentUser(): Promise<UserInfo> {
    try {
      const response = await apiClient.get('/auth/me')
      
      // Backend returns: { user: { email, id, user_type } }
      const userData = response.data.user || response.data
      
      if (!userData.id || !userData.email) {
        throw new Error('Invalid user information received from server')
      }
      
      // Map user_type to role
      const role = userData.user_type || userData.role || 'guest'
      
      return {
        id: userData.id,
        email: userData.email,
        role: role,
        is_premium: role === 'premium' || userData.is_premium || false,
        created_at: userData.created_at || new Date().toISOString()
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Not authenticated. Please log in.')
      }
      throw new Error(error.message || 'Failed to fetch user information. Please try again.')
    }
  }

  /**
   * Logout current user
   * Blacklists the current JWT token
   */
  async logout(): Promise<LogoutResponse> {
    try {
      const response = await apiClient.post('/auth/logout')
      return response.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Not authenticated.')
      }
      throw new Error(error.response?.data?.error?.message || 'Failed to logout. Please try again.')
    }
  }

  /**
   * Validate a JWT token
   * Checks if token is valid, not expired, and not revoked
   * @param request - Optional flag to include session metadata
   */
  async validateToken(request?: ValidateTokenRequest): Promise<ValidateTokenResponse> {
    try {
      const response = await apiClient.post('/auth/validate', request || {})
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Failed to validate token.')
    }
  }

  /**
   * Revoke tokens
   * Can revoke specific token, session, or all user tokens
   * @param request - Token revocation configuration
   */
  async revokeToken(request: RevokeTokenRequest): Promise<RevokeTokenResponse> {
    try {
      const response = await apiClient.post('/auth/revoke', request)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Not authenticated.')
      }
      throw new Error(error.response?.data?.error?.message || 'Failed to revoke token.')
    }
  }

  /**
   * Get all active sessions for authenticated user
   * Returns list of sessions with device info, location, and activity
   */
  async getSessions(): Promise<GetSessionsResponse> {
    try {
      const response = await apiClient.get('/auth/sessions')
      return response.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Not authenticated.')
      }
      throw new Error(error.response?.data?.error?.message || 'Failed to get sessions.')
    }
  }

  /**
   * Delete a specific session
   * Terminates session and revokes all associated tokens
   * @param sessionId - ID of the session to delete
   */
  async deleteSession(sessionId: string): Promise<void> {
    try {
      await apiClient.delete(`/auth/sessions/${sessionId}`)
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Not authenticated.')
      }
      if (error.response?.status === 400) {
        throw new Error('Cannot delete current session.')
      }
      if (error.response?.status === 404) {
        throw new Error('Session not found.')
      }
      throw new Error(error.response?.data?.error?.message || 'Failed to delete session.')
    }
  }
}

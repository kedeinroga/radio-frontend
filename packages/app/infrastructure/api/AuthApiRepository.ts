import apiClient from './apiClient'

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
        throw new Error('Datos de registro inválidos. Verifica tu email y contraseña.')
      }
      console.error('Error registering user:', error)
      throw new Error('Error al registrar usuario. Por favor, intenta de nuevo.')
    }
  }

  /**
   * Login with email and password
   */
  async login(request: LoginRequest): Promise<AuthTokens> {
    try {
      const response = await apiClient.post('/auth/login', request)
      return response.data.data
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Datos de inicio de sesión inválidos.')
      }
      if (error.response?.status === 401) {
        throw new Error('Email o contraseña incorrectos.')
      }
      console.error('Error logging in:', error)
      throw new Error('Error al iniciar sesión. Por favor, intenta de nuevo.')
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
        throw new Error('Refresh token inválido.')
      }
      if (error.response?.status === 401) {
        throw new Error('Refresh token expirado o inválido. Por favor, inicia sesión nuevamente.')
      }
      console.error('Error refreshing token:', error)
      throw new Error('Error al refrescar token. Por favor, intenta de nuevo.')
    }
  }

  /**
   * Get current authenticated user information
   */
  async getCurrentUser(): Promise<UserInfo> {
    try {
      const response = await apiClient.get('/auth/me')
      return response.data.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('No autenticado. Por favor, inicia sesión.')
      }
      console.error('Error getting current user:', error)
      throw new Error('Error al obtener información del usuario. Por favor, intenta de nuevo.')
    }
  }
}

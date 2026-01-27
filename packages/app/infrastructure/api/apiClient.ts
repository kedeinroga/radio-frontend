import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { Locale } from '../../domain/valueObjects/Locale'
import { safeRedirect } from '../utils/securityHelpers'

/**
 * API Client Configuration
 * Axios instance with JWT auto-refresh interceptors and i18n support
 * 
 * ✅ Detecta automáticamente si está en cliente o servidor
 * ✅ Cliente: usa /api routes (Next.js proxy)
 * ✅ Servidor (SSR/SSG): usa backend directo
 */

// Detectar si estamos en el servidor o el cliente
const isServer = typeof window === 'undefined'

// ✅ Configuración dinámica según contexto
const getBaseURL = (): string => {
  if (isServer) {
    // En servidor (SSR/SSG): usar backend directo
    return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
  } else {
    // En cliente: usar /api routes (Next.js proxy)
    return '/api'
  }
}

const API_BASE_URL = getBaseURL()

// Global locale state (injected from i18n system)
let currentLocale: Locale = Locale.default()

/**
 * Sets the current locale for API requests
 * This will add the Accept-Language header to all requests
 */
export const setApiLocale = (locale: Locale): void => {
  currentLocale = locale
}

/**
 * Gets the current API locale
 */
export const getApiLocale = (): Locale => {
  return currentLocale
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  // ✅ Solo en cliente: incluir cookies
  withCredentials: !isServer,
})

/**
 * Helper to get token from localStorage
 * Works in both browser and SSR contexts
 * 
 * ⚠️ NOTA: Con cookies HttpOnly en cliente, esto es legacy.
 * Los tokens ahora están en cookies, no localStorage.
 */
const getTokenFromStorage = (key: string): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(`@radio-app:${key}`)
  } catch (error) {
    return null
  }
}

/**
 * Helper to set token in localStorage
 * ⚠️ LEGACY - Tokens ahora en cookies HttpOnly
 */
const setTokenInStorage = (key: string, value: string): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`@radio-app:${key}`, value)
  } catch (error) {
    // Ignore errors
  }
}

/**
 * Helper to remove token from localStorage
 */
const removeTokenFromStorage = (key: string): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(`@radio-app:${key}`)
  } catch (error) {
    // Ignore errors
  }
}

// Storage for tokens (will be injected)
let tokenStorage: {
  getAccessToken: () => Promise<string | null>
  getRefreshToken: () => Promise<string | null>
  setAccessToken: (token: string) => Promise<void>
  clearTokens: () => Promise<void>
} | null = null

/**
 * Initialize API client with token storage
 * @deprecated - Now uses HttpOnly cookies, but kept for compatibility
 */
export const initializeApiClient = (storage: typeof tokenStorage) => {
  tokenStorage = storage
}

/**
 * Request Interceptor
 * Automatically adds Accept-Language header to requests
 * 
 * ⚠️ NOTA: En cliente, Authorization header no es necesario porque
 * las cookies HttpOnly se envían automáticamente con withCredentials: true
 * 
 * En servidor (SSR/SSG), no hay cookies, así que no enviamos Authorization
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Add Accept-Language header for i18n
    if (config.headers) {
      config.headers['Accept-Language'] = currentLocale.code
    }

    // ⚠️ Legacy: Try to get token from localStorage for backwards compatibility
    // Solo en cliente
    if (!isServer) {
      const token = getTokenFromStorage('access_token')

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * Response Interceptor
 * Handles errors and redirects
 * 
 * ✅ En cliente: las cookies HttpOnly manejan auth automáticamente
 * ✅ En servidor (SSR/SSG): no hay auth, requests son públicos
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Solo manejar 401 en cliente
    if (!isServer && error.response?.status === 401) {
      // Limpiar localStorage (legacy)
      removeTokenFromStorage('access_token')
      removeTokenFromStorage('refresh_token')

      if (tokenStorage) {
        await tokenStorage.clearTokens()
      }

      // Redirigir al login apropiado
      if (typeof window !== 'undefined') {
        const isAdminRoute = window.location.pathname.startsWith('/admin')
        const redirectUrl = isAdminRoute ? '/admin/login' : '/login'
        safeRedirect(redirectUrl)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient

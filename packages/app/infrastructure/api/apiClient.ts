import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

/**
 * API Client Configuration
 * Axios instance with JWT auto-refresh interceptors
 */

const API_BASE_URL =
  typeof window !== 'undefined'
    ? process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'
    : process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds for slow searches
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Helper to get token from localStorage
 * Works in both browser and SSR contexts
 */
const getTokenFromStorage = (key: string): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(`@radio-app:${key}`)
  } catch (error) {
    console.error('Error reading token from storage:', error)
    return null
  }
}

/**
 * Helper to set token in localStorage
 */
const setTokenInStorage = (key: string, value: string): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`@radio-app:${key}`, value)
  } catch (error) {
    console.error('Error writing token to storage:', error)
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
    console.error('Error removing token from storage:', error)
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
 * @deprecated - Now reads directly from localStorage, but kept for compatibility
 */
export const initializeApiClient = (storage: typeof tokenStorage) => {
  tokenStorage = storage
}

/**
 * Request Interceptor
 * Automatically adds JWT token to requests
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Try to get token from localStorage directly (always works after page refresh)
    let token = getTokenFromStorage('access_token')
    
    // Fallback to tokenStorage if available (legacy support)
    if (!token && tokenStorage) {
      token = await tokenStorage.getAccessToken()
    }
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

/**
 * Response Interceptor
 * Handles token refresh on 401 errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Get refresh token from localStorage
        let refreshToken = getTokenFromStorage('refresh_token')
        
        // Fallback to tokenStorage if available
        if (!refreshToken && tokenStorage) {
          refreshToken = await tokenStorage.getRefreshToken()
        }

        if (!refreshToken) {
          // No refresh token, clear tokens and redirect to login
          removeTokenFromStorage('access_token')
          removeTokenFromStorage('refresh_token')
          if (tokenStorage) {
            await tokenStorage.clearTokens()
          }
          
          if (typeof window !== 'undefined') {
            // Check if we're in admin area
            const isAdminRoute = window.location.pathname.startsWith('/admin')
            window.location.href = isAdminRoute ? '/admin/login' : '/login'
          }
          return Promise.reject(error)
        }

        // Attempt to refresh token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        })

        const { access_token } = response.data

        // Save new access token
        setTokenInStorage('access_token', access_token)
        if (tokenStorage) {
          await tokenStorage.setAccessToken(access_token)
        }

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`
        }

        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        removeTokenFromStorage('access_token')
        removeTokenFromStorage('refresh_token')
        if (tokenStorage) {
          await tokenStorage.clearTokens()
        }
        
        if (typeof window !== 'undefined') {
          const isAdminRoute = window.location.pathname.startsWith('/admin')
          window.location.href = isAdminRoute ? '/admin/login' : '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient

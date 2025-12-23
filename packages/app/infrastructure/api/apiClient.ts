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

// Storage for tokens (will be injected)
let tokenStorage: {
  getAccessToken: () => Promise<string | null>
  getRefreshToken: () => Promise<string | null>
  setAccessToken: (token: string) => Promise<void>
  clearTokens: () => Promise<void>
} | null = null

/**
 * Initialize API client with token storage
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
    if (tokenStorage) {
      const token = await tokenStorage.getAccessToken()
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
 * Handles token refresh on 401 errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry && tokenStorage) {
      originalRequest._retry = true

      try {
        const refreshToken = await tokenStorage.getRefreshToken()

        if (!refreshToken) {
          // No refresh token, clear tokens and redirect to login
          await tokenStorage.clearTokens()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          return Promise.reject(error)
        }

        // Attempt to refresh token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        })

        const { access_token } = response.data

        // Save new access token
        await tokenStorage.setAccessToken(access_token)

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`
        }

        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        await tokenStorage.clearTokens()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient

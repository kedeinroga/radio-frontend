import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { Locale } from '../../domain/valueObjects/Locale'

/**
 * API Client
 *
 * Cliente HTTP del navegador hacia las rutas /api de la propia app (que consultan Radio
 * Browser en el servidor). No hay backend propio ni autenticación: solo añade el idioma.
 */

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

const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request Interceptor
 * Automatically adds Accept-Language header to requests
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (config.headers) {
      config.headers['Accept-Language'] = currentLocale.code
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

export default apiClient

/**
 * API Routes Constants
 * 
 * Centralización de todas las rutas de API.
 * 
 * ✅ Sin magic strings
 * ✅ Type-safe con TypeScript
 * ✅ Fácil de mantener y refactorizar
 * ✅ Autocomplete en IDE
 * 
 * Uso:
 * ```typescript
 * import { API_ROUTES } from '@/lib/constants/api'
 * 
 * const data = await get(API_ROUTES.STATIONS.POPULAR)
 * const station = await get(API_ROUTES.STATIONS.BY_ID('123'))
 * ```
 */

export const API_ROUTES = {
  STATIONS: {
    LIST: '/stations',
    POPULAR: '/stations/popular',
    SEARCH: '/stations/search',
    BY_ID: (id: string) => `/stations/${id}`,
  },

  ADMIN: {
    ANALYTICS: {
      USERS_ACTIVE: '/admin/analytics/users/active',
      USERS_GUEST: '/admin/analytics/users/guest',
      POPULAR_STATIONS: (range?: string, limit?: number) => {
        const params = new URLSearchParams()
        if (range) params.append('range', range)
        if (limit) params.append('limit', limit.toString())
        const query = params.toString()
        return `/admin/analytics/stations/popular${query ? `?${query}` : ''}`
      },
      TRENDING_SEARCHES: (range?: string, limit?: number) => {
        const params = new URLSearchParams()
        if (range) params.append('range', range)
        if (limit) params.append('limit', limit.toString())
        const query = params.toString()
        return `/admin/analytics/searches/trending${query ? `?${query}` : ''}`
      },
    },
    SEO: {
      STATS: '/admin/seo/stats',
      REFRESH: '/admin/seo/refresh-stats',
    },
    TRANSLATIONS: {
      LIST: (stationId: string) => `/admin/translations/${stationId}`,
      GET: (stationId: string, lang: string) => `/admin/translations/${stationId}/${lang}`,
      CREATE: '/admin/translations',
      BULK: '/admin/translations/bulk',
      UPDATE: (stationId: string, lang: string) => `/admin/translations/${stationId}/${lang}`,
      DELETE: (stationId: string, lang: string) => `/admin/translations/${stationId}/${lang}`,
    },
    MAINTENANCE: {
      PARTITIONS: '/admin/maintenance/partitions',
      RECOMMENDATIONS: '/admin/maintenance/recommendations',
      REFRESH_VIEWS: '/admin/maintenance/refresh-views',
      CHECK_PARTITIONS: '/admin/maintenance/check-partitions',
      CLEANUP_PARTITIONS: '/admin/maintenance/cleanup-partitions',
      FULL: '/admin/maintenance/full',
    },
    MONITORING: {
      HEALTH: '/admin/monitoring/health',
      ALERTS: '/admin/monitoring/alerts',
    },
    SECURITY: {
      LOGS: '/admin/security/logs',
      METRICS: '/admin/security/metrics',
    },
  },

  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    SESSIONS: '/auth/sessions',
    SESSION_BY_ID: (sessionId: string) => `/auth/sessions/${sessionId}`,
  },

  SUBSCRIPTION: {
    STATUS: '/subscription/status',
    CHECKOUT: '/subscription/checkout',
    CANCEL: '/subscription/cancel',
  },

  STRIPE: {
    CHECKOUT: '/stripe/checkout',
    WEBHOOK: '/stripe/webhook',
  },

  ADS: {
    AUDIO: '/ads/audio',
    TRACK_CLICK: '/ads/track/click',
  },

  ANALYTICS: {
    PROXY: (path: string) => `/analytics/${path}`,
  },
} as const

/**
 * HTTP Timeouts
 */
export const HTTP_TIMEOUTS = {
  DEFAULT: 30000, // 30 segundos
  SEARCH: 60000, // 1 minuto para búsquedas
  UPLOAD: 120000, // 2 minutos para uploads
  SHORT: 10000, // 10 segundos para requests rápidos
} as const

/**
 * HTTP Headers comunes
 */
export const HTTP_HEADERS = {
  JSON: {
    'Content-Type': 'application/json',
  },
  FORM_DATA: {
    'Content-Type': 'multipart/form-data',
  },
} as const

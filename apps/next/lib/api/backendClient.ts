/**
 * Backend HTTP Client
 *
 * Cliente HTTP para usar SOLO en API Routes de Next.js (server-side).
 *
 * ✅ Conoce el backend real (process.env.API_URL)
 * ✅ Inyecta API_SECRET_KEY en cada petición como X-Rradio-Secret
 * ✅ Sin NEXT_PUBLIC_ prefix = solo servidor
 * ❌ NUNCA importar en componentes del cliente
 *
 * Este cliente hace proxy desde Next.js API routes al backend real,
 * ocultando el endpoint real y la clave secreta del código del cliente.
 */

const API_URL = process.env.API_URL!
const API_SECRET_KEY = process.env.API_SECRET_KEY!

if (!API_URL) {
  throw new Error(
    '❌ API_URL environment variable is not set.\n' +
    'This should be set server-side only (without NEXT_PUBLIC_ prefix).\n' +
    'Example: API_URL=http://localhost:8080/api/v1'
  )
}

if (!API_SECRET_KEY) {
  throw new Error(
    '❌ API_SECRET_KEY environment variable is not set.\n' +
    'This should be set server-side only (without NEXT_PUBLIC_ prefix).\n' +
    'Example: API_SECRET_KEY=your-secret-key'
  )
}

// ─── Typed Backend Error ──────────────────────────────────────────────────────

export class BackendError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly body: string
  ) {
    super(`Backend error ${status} (${statusText}): ${body}`)
    this.name = 'BackendError'
  }

  /** True when the backend rejected the secret key (misconfigured or rotated). */
  get isUnauthorized(): boolean {
    return this.status === 401
  }

  /** True when the backend encountered an internal error. */
  get isServerError(): boolean {
    return this.status >= 500
  }
}

interface BackendRequestOptions {
  headers?: Record<string, string>
  timeout?: number
}

/**
 * Backend HTTP Client
 * Solo para uso en API routes (server-side)
 */
export class BackendHttpClient {
  private baseURL: string = API_URL

  async get<T>(endpoint: string, options?: BackendRequestOptions): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options)
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: BackendRequestOptions
  ): Promise<T> {
    return this.request<T>('POST', endpoint, data, options)
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: BackendRequestOptions
  ): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options)
  }

  async delete<T>(
    endpoint: string,
    options?: BackendRequestOptions
  ): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options)
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: BackendRequestOptions
  ): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, options)
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    options?: BackendRequestOptions
  ): Promise<T> {
    const timeout = options?.timeout ?? 30000
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const url = `${this.baseURL}${endpoint}`

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // ✅ Clave secreta enviada SOLO desde el servidor — nunca expuesta al cliente
          'X-Rradio-Secret': API_SECRET_KEY,
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        const backendError = new BackendError(response.status, response.statusText, errorText)

        // 401 — La clave secreta fue rechazada o está desactualizada.
        if (backendError.isUnauthorized) {
          console.error(
            '[BackendClient] ❌ 401 Unauthorized — verifica que API_SECRET_KEY coincida con el backend.',
            { endpoint, status: 401 }
          )
        }

        // 5xx — Error interno del backend.
        if (backendError.isServerError) {
          console.error(
            `[BackendClient] ❌ ${response.status} Server Error — error interno del backend.`,
            { endpoint, status: response.status, body: errorText }
          )
        }

        throw backendError
      }

      // Handle empty responses (204 No Content)
      if (response.status === 204) {
        return undefined as T
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Backend request timeout after ${timeout}ms`)
      }

      throw error
    }
  }
}

// Singleton instance para reutilizar
export const backendHttpClient = new BackendHttpClient()

/**
 * Backend HTTP Client
 * 
 * Cliente HTTP para usar SOLO en API Routes de Next.js (server-side).
 * 
 * ✅ Conoce el backend real (process.env.API_URL)
 * ✅ Sin NEXT_PUBLIC_ prefix = solo servidor
 * ❌ NUNCA importar en componentes del cliente
 * 
 * Este cliente hace proxy desde Next.js API routes al backend real,
 * ocultando el endpoint real del código del cliente.
 */

const API_URL = process.env.API_URL

if (!API_URL) {
  throw new Error(
    '❌ API_URL environment variable is not set.\n' +
    'This should be set server-side only (without NEXT_PUBLIC_ prefix).\n' +
    'Example: API_URL=http://localhost:8080/api/v1'
  )
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
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(
          `Backend request failed: ${response.status} ${response.statusText}\n${errorText}`
        )
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

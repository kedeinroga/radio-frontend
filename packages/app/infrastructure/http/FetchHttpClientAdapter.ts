/**
 * Fetch HTTP Client Adapter
 * 
 * Implementación concreta de IHttpClient usando Fetch API.
 * Este adaptador se usa en el CLIENTE (navegador).
 * 
 * ✅ Solo hace requests a /api/* (rutas Next.js)
 * ✅ NUNCA conoce el backend real
 * ✅ El backend está oculto en las API routes de Next.js
 */

import {
  IHttpClient,
  RequestOptions,
  HttpError,
  NetworkError,
  TimeoutError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
  ServerError,
} from '../../domain/repositories/IHttpClient'

export class FetchHttpClientAdapter implements IHttpClient {
  constructor(
    private readonly baseURL: string = '/api' // ✅ Solo rutas relativas a Next.js
  ) { }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options)
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>('POST', endpoint, data, options)
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options)
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options)
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, options)
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const timeout = options?.timeout ?? 30000
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      // Construir URL con query params si existen
      let url = `${this.baseURL}${endpoint}`
      if (options?.params) {
        const searchParams = new URLSearchParams()
        Object.entries(options.params).forEach(([key, value]) => {
          searchParams.append(key, String(value))
        })
        url += `?${searchParams.toString()}`
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
        credentials: 'include', // ✅ Para cookies HttpOnly (auth)
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }

      // Manejar respuestas vacías (204 No Content)
      if (response.status === 204) {
        return undefined as T
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)

      // Re-lanzar errores HTTP ya procesados
      if (error instanceof HttpError) {
        throw error
      }

      // Manejar errores de abort/timeout
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new TimeoutError(timeout)
        }
        throw new NetworkError(error.message, error)
      }

      // Error desconocido
      throw new NetworkError('Unknown error occurred', error)
    }
  }

  private async handleErrorResponse(response: Response): Promise<HttpError> {
    let errorMessage = response.statusText
    let errorCode = 'HTTP_ERROR'

    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
      errorCode = errorData.code || errorCode
    } catch {
      // Si no se puede parsear JSON, usar statusText
    }

    switch (response.status) {
      case 400:
        return new BadRequestError(errorMessage)
      case 401:
        return new UnauthorizedError(errorMessage)
      case 403:
        return new ForbiddenError(errorMessage)
      case 404:
        return new NotFoundError(errorMessage)
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(errorMessage, response.status)
      default:
        return new HttpError(errorMessage, response.status, errorCode)
    }
  }
}

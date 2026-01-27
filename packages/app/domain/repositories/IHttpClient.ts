/**
 * HTTP Client Port (Interface)
 * 
 * Define el contrato para clientes HTTP sin especificar implementación.
 * Siguiendo Clean Architecture, esta interfaz permite:
 * - Dependency Inversion: Capas superiores dependen de esta abstracción
 * - Testability: Fácil de mockear en tests
 * - Flexibility: Cambiar implementación (fetch, axios, etc.) sin afectar el código
 */

export interface RequestOptions {
  headers?: Record<string, string>
  timeout?: number
  params?: Record<string, string | number | boolean>
}

export interface IHttpClient {
  /**
   * Realizar GET request
   */
  get<T>(endpoint: string, options?: RequestOptions): Promise<T>

  /**
   * Realizar POST request
   */
  post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T>

  /**
   * Realizar PUT request
   */
  put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T>

  /**
   * Realizar DELETE request
   */
  delete<T>(endpoint: string, options?: RequestOptions): Promise<T>

  /**
   * Realizar PATCH request
   */
  patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T>
}

/**
 * HTTP Error - Domain Error
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly originalError?: unknown
  ) {
    super(message)
    this.name = 'HttpError'
  }
}

/**
 * Network Error - When request fails to reach server
 */
export class NetworkError extends HttpError {
  constructor(message: string, originalError?: unknown) {
    super(message, 0, 'NETWORK_ERROR', originalError)
    this.name = 'NetworkError'
  }
}

/**
 * Timeout Error - When request takes too long
 */
export class TimeoutError extends HttpError {
  constructor(timeout: number) {
    super(`Request timeout after ${timeout}ms`, 408, 'TIMEOUT')
    this.name = 'TimeoutError'
  }
}

/**
 * Unauthorized Error - 401
 */
export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

/**
 * Forbidden Error - 403
 */
export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

/**
 * Not Found Error - 404
 */
export class NotFoundError extends HttpError {
  constructor(message = 'Not found') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

/**
 * Bad Request Error - 400
 */
export class BadRequestError extends HttpError {
  constructor(message = 'Bad request') {
    super(message, 400, 'BAD_REQUEST')
    this.name = 'BadRequestError'
  }
}

/**
 * Server Error - 5xx
 */
export class ServerError extends HttpError {
  constructor(message = 'Server error', statusCode = 500) {
    super(message, statusCode, 'SERVER_ERROR')
    this.name = 'ServerError'
  }
}

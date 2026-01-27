/**
 * Make HTTP Request Use Case
 * 
 * Use case de aplicación para hacer requests HTTP.
 * Depende de IHttpClient (interfaz), no de implementación concreta.
 * 
 * Siguiendo Clean Architecture:
 * - Esta capa orquesta la lógica de negocio
 * - Depende de abstracciones (Domain layer)
 * - NO conoce detalles de implementación (Infrastructure)
 */

import { IHttpClient, RequestOptions } from '../../domain/repositories/IHttpClient'

export class MakeHttpRequest {
  constructor(private readonly httpClient: IHttpClient) { }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    // Aquí se puede agregar lógica de negocio común
    // - Logging
    // - Validaciones
    // - Transformaciones
    return this.httpClient.get<T>(endpoint, options)
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.httpClient.post<T>(endpoint, data, options)
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.httpClient.put<T>(endpoint, data, options)
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.httpClient.delete<T>(endpoint, options)
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    return this.httpClient.patch<T>(endpoint, data, options)
  }
}

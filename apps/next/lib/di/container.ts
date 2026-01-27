/**
 * Dependency Injection Container
 * 
 * Aquí se conectan las INTERFACES (Domain) con las IMPLEMENTACIONES (Infrastructure).
 * 
 * Siguiendo Clean Architecture y SOLID:
 * - Dependency Inversion: Depende de abstracciones, no de implementaciones
 * - Single Responsibility: Solo maneja la creación de dependencias
 * - Open/Closed: Fácil agregar nuevas implementaciones
 * 
 * Beneficios:
 * - Testing: Fácil inyectar mocks
 * - Flexibility: Cambiar implementación sin afectar el código
 * - Decoupling: Componentes no conocen implementaciones concretas
 */

import { IHttpClient } from '@radio-app/app/domain/repositories/IHttpClient'
import { FetchHttpClientAdapter } from '@radio-app/app/infrastructure/http/FetchHttpClientAdapter'
import { MakeHttpRequest } from '@radio-app/app/application/useCases/http/MakeHttpRequest'

/**
 * Dependency Injection Container
 * Singleton que maneja las dependencias de la aplicación
 */
class DIContainer {
  private static httpClient: IHttpClient | null = null
  private static makeHttpRequest: MakeHttpRequest | null = null

  /**
   * Obtener cliente HTTP
   * ✅ Retorna implementación que solo usa /api/* routes
   */
  static getHttpClient(): IHttpClient {
    if (!this.httpClient) {
      // Aquí decidimos QUÉ implementación usar
      // En el futuro podríamos cambiarlo a AxiosHttpClientAdapter sin afectar el código
      this.httpClient = new FetchHttpClientAdapter('/api')
    }
    return this.httpClient
  }

  /**
   * Obtener use case para hacer HTTP requests
   */
  static getMakeHttpRequest(): MakeHttpRequest {
    if (!this.makeHttpRequest) {
      this.makeHttpRequest = new MakeHttpRequest(this.getHttpClient())
    }
    return this.makeHttpRequest
  }

  /**
   * Para testing: permitir inyectar mocks
   * 
   * Ejemplo de uso en tests:
   * ```typescript
   * const mockClient = createMockHttpClient()
   * DIContainer.setHttpClient(mockClient)
   * ```
   */
  static setHttpClient(mockClient: IHttpClient): void {
    this.httpClient = mockClient
    this.makeHttpRequest = null // Reset para que use el nuevo client
  }

  /**
   * Resetear todas las dependencias
   * Útil en tests para limpiar estado entre tests
   */
  static reset(): void {
    this.httpClient = null
    this.makeHttpRequest = null
  }
}

export default DIContainer

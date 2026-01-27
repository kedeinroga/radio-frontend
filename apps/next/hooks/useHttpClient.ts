/**
 * useHttpClient Hook
 * 
 * Hook personalizado para hacer HTTP requests desde componentes React.
 * 
 * ✅ Usa Dependency Injection
 * ✅ Componentes dependen de este hook, NO de implementación
 * ✅ Fácil de testear (mockear el DI container)
 * ✅ Tipo-seguro con TypeScript
 * 
 * Ejemplo de uso:
 * ```typescript
 * const { get, post } = useHttpClient()
 * 
 * const fetchData = async () => {
 *   const data = await get<Station[]>(API_ROUTES.STATIONS.POPULAR)
 *   setStations(data)
 * }
 * ```
 */

'use client'

import { useCallback } from 'react'
import DIContainer from '@/lib/di/container'
import type { RequestOptions } from '@radio-app/app/domain/repositories/IHttpClient'

export function useHttpClient() {
  const makeRequest = DIContainer.getMakeHttpRequest()

  const get = useCallback(
    async <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
      return makeRequest.get<T>(endpoint, options)
    },
    [makeRequest]
  )

  const post = useCallback(
    async <T>(
      endpoint: string,
      data?: unknown,
      options?: RequestOptions
    ): Promise<T> => {
      return makeRequest.post<T>(endpoint, data, options)
    },
    [makeRequest]
  )

  const put = useCallback(
    async <T>(
      endpoint: string,
      data?: unknown,
      options?: RequestOptions
    ): Promise<T> => {
      return makeRequest.put<T>(endpoint, data, options)
    },
    [makeRequest]
  )

  const del = useCallback(
    async <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
      return makeRequest.delete<T>(endpoint, options)
    },
    [makeRequest]
  )

  const patch = useCallback(
    async <T>(
      endpoint: string,
      data?: unknown,
      options?: RequestOptions
    ): Promise<T> => {
      return makeRequest.patch<T>(endpoint, data, options)
    },
    [makeRequest]
  )

  return {
    get,
    post,
    put,
    delete: del, // 'delete' es palabra reservada, usar 'del'
    patch,
  }
}

/**
 * EJEMPLO: Componente usando useHttpClient
 * 
 * Este ejemplo muestra cómo usar el nuevo sistema HTTP Client con:
 * ✅ Clean Architecture (depende de abstracción via hook)
 * ✅ Dependency Injection
 * ✅ Constantes centralizadas (no magic strings)
 * ✅ Type-safe
 * ✅ Fácil de testear
 * 
 * ANTES (❌):
 * ```typescript
 * const response = await fetch('https://api.rradio.online/api/v1/stations/popular')
 * // - Backend URL expuesto
 * // - Magic strings
 * // - Código duplicado
 * // - Difícil de testear
 * ```
 * 
 * DESPUÉS (✅):
 * ```typescript
 * const { get } = useHttpClient()
 * const data = await get(API_ROUTES.STATIONS.POPULAR)
 * // - Backend URL oculto
 * // - Constantes
 * // - Sin duplicación
 * // - Fácil de testear
 * ```
 */

'use client'

import { useState, useEffect } from 'react'
import { useHttpClient } from '@/hooks/useHttpClient'
import { API_ROUTES, HTTP_TIMEOUTS } from '@/lib/constants/api'
import type { Station } from '@radio-app/app'
import { 
  HttpError, 
  NotFoundError, 
  NetworkError 
} from '@radio-app/app'

interface ApiResponse<T> {
  data: T
  meta?: {
    total: number
    page: number
    limit: number
  }
}

export function StationListExample() {
  const { get } = useHttpClient()
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStations()
  }, [])

  const fetchStations = async () => {
    try {
      setLoading(true)
      setError(null)

      // ✅ Usa hook con Dependency Injection
      // ✅ Usa constantes (no magic strings)
      // ✅ Type-safe con genéricos
      // ✅ El backend URL está OCULTO (solo /api/stations/popular)
      const response = await get<ApiResponse<Station[]>>(
        API_ROUTES.STATIONS.POPULAR,
        {
          params: {
            limit: 20,
            lang: 'es',
          },
          timeout: HTTP_TIMEOUTS.DEFAULT,
        }
      )

      setStations(response.data)
    } catch (err) {
      // ✅ Manejo de errores tipo-seguro con errores del dominio
      if (err instanceof NotFoundError) {
        setError('No se encontraron estaciones')
      } else if (err instanceof NetworkError) {
        setError('Error de red. Por favor verifica tu conexión.')
      } else if (err instanceof HttpError) {
        setError(`Error ${err.statusCode}: ${err.message}`)
      } else {
        setError('Error desconocido')
      }
    } finally {
      setLoading(false)
    }
  }

  const searchStations = async (query: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await get<ApiResponse<Station[]>>(
        API_ROUTES.STATIONS.SEARCH,
        {
          params: {
            q: query,
            limit: 50,
          },
          timeout: HTTP_TIMEOUTS.SEARCH, // Timeout más largo para búsquedas
        }
      )

      setStations(response.data)
    } catch (err) {
      if (err instanceof HttpError) {
        setError(err.message)
      } else {
        setError('Error al buscar estaciones')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">{error}</p>
        <button
          onClick={fetchStations}
          className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Estaciones Populares</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {stations.length} estaciones
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stations.map((station) => (
          <div
            key={station.id}
            className="bg-white dark:bg-neutral-900 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-lg">{station.name}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {station.country}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

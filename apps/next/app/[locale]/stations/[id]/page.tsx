'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Play, Pause, Heart, Radio, Globe, Tag } from 'lucide-react'
import { StationApiRepository } from '@radio-app/app'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { EmptyState } from '@/components/EmptyState'
import { usePlayer } from '@/hooks/usePlayer'
import { useFavorites } from '@/hooks/useFavorites'

const stationRepo = new StationApiRepository()

export default function StationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const stationId = params.id as string

  const [station, setStation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [, setFavoritesState] = useState(0)
  const [imgError, setImgError] = useState(false)

  const { play, togglePlayPause, currentStation, playerState } = usePlayer()
  const { isFavorite, toggleFavorite } = useFavorites()

  const isCurrentStation = currentStation?.id === stationId
  const isPlaying = isCurrentStation && playerState.isPlaying
  const isBuffering = isCurrentStation && playerState.isBuffering

  // Load station details
  useEffect(() => {
    const loadStation = async () => {
      try {
        setIsLoading(true)
        const data = await stationRepo.findById(stationId)
        if (data) {
          setStation(data)
        } else {
          setError(true)
        }
      } catch (err) {

        setError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadStation()
  }, [stationId])

  const handlePlayPause = () => {
    if (isCurrentStation) {
      togglePlayPause()
    } else {
      play(station)
    }
  }

  const handleToggleFavorite = () => {
    toggleFavorite(station)
    setFavoritesState(prev => prev + 1)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="large" message="Cargando estación..." />
      </main>
    )
  }

  if (error || !station) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <EmptyState
            icon="📻"
            title="Estación no encontrada"
            message="No pudimos encontrar esta estación. Es posible que haya sido eliminada."
          />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg px-2 py-1"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver
        </button>

        {/* Station Header */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="md:flex">
            {/* Station Image */}
            <div className="md:w-1/3 bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-8">
              <div className="w-full max-w-xs aspect-square rounded-xl shadow-2xl overflow-hidden bg-gray-800 flex items-center justify-center">
                {!imgError && station.imageUrl ? (
                  <img
                    src={station.imageUrl}
                    alt={station.name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                    <Radio className="w-24 h-24 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Station Info */}
            <div className="md:w-2/3 p-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {station.name}
              </h1>

              {/* Metadata */}
              <div className="space-y-3 mb-6">
                {station.country && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Globe className="w-5 h-5" />
                    <span>{station.country}</span>
                  </div>
                )}
                {station.genre && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Tag className="w-5 h-5" />
                    <span className="capitalize">{station.genre}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {/* Play/Pause Button */}
                <button
                  onClick={handlePlayPause}
                  disabled={isBuffering}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                >
                  {isBuffering ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Cargando...</span>
                    </>
                  ) : isPlaying ? (
                    <>
                      <Pause className="w-6 h-6" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6" />
                      <span>Reproducir</span>
                    </>
                  )}
                </button>

                {/* Favorite Button */}
                <button
                  onClick={handleToggleFavorite}
                  className={`p-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    isFavorite(station.id)
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                  aria-label={isFavorite(station.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart className={`w-6 h-6 ${isFavorite(station.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Now Playing Indicator */}
              {isCurrentStation && (
                <div className="mt-4 flex items-center gap-2 text-primary-500">
                  <div className="flex gap-1">
                    <div className="w-1 h-4 bg-primary-500 animate-pulse" style={{ animationDelay: '0ms' }} />
                    <div className="w-1 h-4 bg-primary-500 animate-pulse" style={{ animationDelay: '150ms' }} />
                    <div className="w-1 h-4 bg-primary-500 animate-pulse" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="font-medium">Reproduciendo ahora</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Información de la Estación
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                Nombre
              </h3>
              <p className="text-lg text-gray-900 dark:text-white">
                {station.name}
              </p>
            </div>

            {station.country && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  País
                </h3>
                <p className="text-lg text-gray-900 dark:text-white">
                  {station.country}
                </p>
              </div>
            )}

            {station.genre && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Género
                </h3>
                <p className="text-lg text-gray-900 dark:text-white capitalize">
                  {station.genre}
                </p>
              </div>
            )}

            {station.bitrate && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                  Calidad
                </h3>
                <p className="text-lg text-gray-900 dark:text-white">
                  {station.bitrate} kbps
                </p>
              </div>
            )}
          </div>

          {station.description && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                Descripción
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {station.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

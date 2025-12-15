'use client'

import { useState, useEffect } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import { StationCard } from '@/components/StationCard'
import { EmptyState } from '@/components/EmptyState'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { usePlayer } from '@/hooks/usePlayer'
import { useFavorites } from '@/hooks/useFavorites'
import { StationApiRepository } from '@radio-app/app'

const stationRepo = new StationApiRepository()

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [stations, setStations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [favoritesState, setFavoritesState] = useState(0)
  
  const { play, togglePlayPause, currentStation, playerState } = usePlayer()
  const { isFavorite, toggleFavorite } = useFavorites()

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setStations([])
      setHasSearched(false)
      return
    }

    setIsLoading(true)
    const timeoutId = setTimeout(async () => {
      try {
        const results = await stationRepo.search(query, 20)
        setStations(results)
        setHasSearched(true)
      } catch (error) {
        console.error('Search error:', error)
        setStations([])
      } finally {
        setIsLoading(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleClear = () => {
    setQuery('')
    setStations([])
    setHasSearched(false)
  }

  const handleToggleFavorite = (station: any) => {
    toggleFavorite(station)
    setFavoritesState(prev => prev + 1)
  }

  const handlePlay = (station: any) => {
    // If clicking on the current station, toggle play/pause
    if (currentStation?.id === station.id) {
      togglePlayPause()
    } else {
      // Otherwise, play the new station
      play(station)
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <SearchIcon className="w-8 h-8 text-primary-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Buscar Estaciones
          </h1>
        </div>

        {/* Search Input */}
        <div className="mb-8 relative">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, género o país..."
              className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              aria-label="Buscar estaciones"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label="Limpiar búsqueda"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
          
          {/* Search hint */}
          {!query && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              💡 Intenta buscar por nombre (ej: "BBC"), género (ej: "rock") o país (ej: "Spain")
            </p>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : stations.length > 0 ? (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {stations.length} {stations.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stations.map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  onPlay={() => handlePlay(station)}
                  isPlaying={currentStation?.id === station.id && playerState.isPlaying}
                  isBuffering={currentStation?.id === station.id && playerState.isBuffering}
                  isFavorite={isFavorite(station.id)}
                  onFavorite={() => handleToggleFavorite(station)}
                />
              ))}
            </div>
          </div>
        ) : hasSearched ? (
          <EmptyState
            icon="🔍"
            title="No se encontraron resultados"
            message={`No encontramos estaciones que coincidan con "${query}". Intenta con otros términos de búsqueda.`}
          />
        ) : (
          <EmptyState
            icon="🎵"
            title="Busca tu estación favorita"
            message="Escribe el nombre, género o país para encontrar estaciones de radio de todo el mundo."
          />
        )}
      </div>
    </main>
  )
}

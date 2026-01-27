'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search as SearchIcon, X } from 'lucide-react'
import { StationCard } from '@/components/StationCard'
import { EmptyState } from '@/components/EmptyState'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { usePlayer } from '@/hooks/usePlayer'
import { useFavorites } from '@/hooks/useFavorites'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { StationApiRepository } from '@radio-app/app'

const stationRepo = new StationApiRepository()

export default function SearchPage() {
  const { t } = useAppTranslation()
  const searchParams = useSearchParams()
  
  const [query, setQuery] = useState('')
  const [stations, setStations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [, setFavoritesState] = useState(0)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSlowSearch, setIsSlowSearch] = useState(false)
  
  const { play, togglePlayPause, currentStation, playerState } = usePlayer()
  const { isFavorite, toggleFavorite } = useFavorites()

  // Get filter params from URL
  const genreParam = searchParams.get('genre')
  const countryParam = searchParams.get('country')

  // Effect to handle URL params (genre/country filters)
  useEffect(() => {
    const loadFilteredStations = async () => {
      if (!genreParam && !countryParam) return

      setIsLoading(true)
      setSearchError(null)
      setIsSlowSearch(false)
      setHasSearched(true)

      const slowSearchTimer = setTimeout(() => {
        setIsSlowSearch(true)
      }, 5000)

      try {
        let results: any[] = []
        
        if (genreParam) {
          results = await stationRepo.getByGenre(genreParam, 20)
        } else if (countryParam) {
          results = await stationRepo.getByCountry(countryParam, 20)
        }
        
        setStations(results)
      } catch (error: any) {
        setStations([])
        setSearchError(error.message || t('search.errorSearching'))
      } finally {
        setIsLoading(false)
        setIsSlowSearch(false)
        clearTimeout(slowSearchTimer)
      }
    }

    loadFilteredStations()
  }, [genreParam, countryParam])

  // Debounced text search
  useEffect(() => {
    // Don't search if we have genre/country filters
    if (genreParam || countryParam) return
    
    if (!query.trim()) {
      setStations([])
      setHasSearched(false)
      setSearchError(null)
      setIsSlowSearch(false)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setSearchError(null)
    setIsSlowSearch(false)
    
    // Set a timer to show slow search message after 5 seconds
    const slowSearchTimer = setTimeout(() => {
      setIsSlowSearch(true)
    }, 5000)
    
    const timeoutId = setTimeout(async () => {
      try {
        const results = await stationRepo.search(query, 20)
        setStations(results)
        setHasSearched(true)
      } catch (error: any) {

        setStations([])
        setHasSearched(true)
        // Set user-friendly error message
        setSearchError(error.message || t('search.errorSearching'))
      } finally {
        setIsLoading(false)
        setIsSlowSearch(false)
        clearTimeout(slowSearchTimer)
      }
    }, 500) // 500ms debounce

    return () => {
      clearTimeout(timeoutId)
      clearTimeout(slowSearchTimer)
    }
  }, [query, genreParam, countryParam, t])

  const handleClear = () => {
    setQuery('')
    setStations([])
    setHasSearched(false)
    setSearchError(null)
    setIsSlowSearch(false)
    setIsLoading(false)
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
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <SearchIcon className="w-8 h-8 text-primary-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('search.title')}
            </h1>
          </div>
          
          {/* Active Filter Badge */}
          {(genreParam || countryParam) && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('common.filter')}:
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-sm font-medium">
                {genreParam ? `🎵 ${genreParam}` : `🌍 ${countryParam}`}
              </span>
            </div>
          )}
        </div>

        {/* Search Input */}
        <div className="mb-8 relative">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              disabled={!!(genreParam || countryParam)}
              className="w-full pl-12 pr-12 py-4 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('search.searchStations')}
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                aria-label={t('search.clearSearch')}
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>
          
          {/* Search hint - hide when filters are active */}
          {!query && !genreParam && !countryParam && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              💡 {t('search.hint')}
            </p>
          )}
          
          {/* Filter hint */}
          {(genreParam || countryParam) && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {genreParam 
                ? `🎵 ${t('common.search')} ${genreParam}...`
                : `🌍 ${t('common.search')} ${countryParam}...`
              }
            </p>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="large" />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {t('search.searching')}
            </p>
            {isSlowSearch && (
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg max-w-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⏳ {t('search.slowSearch')}
                </p>
              </div>
            )}
          </div>
        ) : searchError ? (
          <EmptyState
            icon="⚠️"
            title={t('search.errorTitle')}
            message={searchError}
          />
        ) : stations.length > 0 ? (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {stations.length === 1 
                ? t('search.resultsCount', { count: stations.length }) 
                : t('search.resultsCount_other', { count: stations.length })}
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
            title={t('search.noResults')}
            message={t('search.noResultsDescription', { query })}
          />
        ) : (
          <EmptyState
            icon="🎵"
            title={t('search.emptyTitle')}
            message={t('search.emptyDescription')}
          />
        )}
      </div>
    </main>
  )
}

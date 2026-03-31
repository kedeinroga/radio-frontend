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
    <main id="main-content" className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">

        {/* ── Page header ──────────────────────────────── */}
        <header className="flex items-center gap-3 mb-7 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
            <SearchIcon className="w-5 h-5 text-amber-500" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold text-white">
              {t('search.title')}
            </h1>
            {(genreParam || countryParam) && (
              <p className="font-broadcast text-[10px] text-amber-500/70 mt-0.5 truncate tracking-wide uppercase">
                {genreParam ?? countryParam}
              </p>
            )}
          </div>
        </header>

        {/* ── Search input ─────────────────────────────── */}
        <div className="mb-7 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <div className="relative">
            <SearchIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              disabled={!!(genreParam || countryParam)}
              className="
                w-full pl-11 pr-11 py-3.5 rounded-xl
                bg-white/[0.05] border border-white/[0.08]
                text-white placeholder-neutral-600
                font-broadcast text-sm
                focus:outline-none focus:border-amber-500/40 focus:bg-white/[0.08]
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-200
              "
              aria-label={t('search.searchStations')}
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors focus:outline-none"
                aria-label={t('search.clearSearch')}
              >
                <X className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Hints */}
          {!query && !genreParam && !countryParam && (
            <p className="font-broadcast text-[10px] text-neutral-600 mt-2 tracking-wide">
              {t('search.hint')}
            </p>
          )}
        </div>

        {/* ── Results ──────────────────────────────────── */}
        {isLoading ? (
          <div className="py-8">
            <LoadingSpinner message={t('search.searching')} />
            {isSlowSearch && (
              <p className="font-broadcast text-[10px] text-amber-500/60 text-center mt-2 tracking-wide">
                {t('search.slowSearch')}
              </p>
            )}
          </div>
        ) : searchError ? (
          <EmptyState icon="⚠️" title={t('search.errorTitle')} message={searchError} />
        ) : stations.length > 0 ? (
          <div>
            <p className="font-broadcast text-[10px] text-neutral-600 mb-4 tracking-wide">
              {stations.length === 1
                ? t('search.resultsCount', { count: stations.length })
                : t('search.resultsCount_other', { count: stations.length })}
            </p>
            <div className="space-y-2">
              {stations.map((station, i) => (
                <div
                  key={station.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 35}ms` }}
                >
                  <StationCard
                    station={station}
                    onPlay={() => handlePlay(station)}
                    isPlaying={currentStation?.id === station.id && playerState.isPlaying}
                    isBuffering={currentStation?.id === station.id && playerState.isBuffering}
                    isFavorite={isFavorite(station.id)}
                    onFavorite={() => handleToggleFavorite(station)}
                  />
                </div>
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

'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { StationApiRepository } from '@radio-app/app'
import { StationCard } from '@/components/StationCard'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { EmptyState } from '@/components/EmptyState'
import { LanguageSelector } from '@/components/LanguageSelector'
import { FAQSection } from '@/components/FAQSection'
import { usePlayer } from '@/hooks/usePlayer'
import { useFavorites } from '@/hooks/useFavorites'
import { useAppTranslation } from '@/hooks/useAppTranslation'
// import { PremiumBanner } from '@/components/premium/PremiumBanner' // Premium: Commented for ads-only phase

const stationRepo = new StationApiRepository()

export default function HomePage() {
  const [, setFavoritesState] = useState(0) // Force re-render on favorite changes
  const { t } = useAppTranslation()
  
  const { data: stations, isLoading, error } = useQuery({
    queryKey: ['popular-stations'],
    queryFn: () => stationRepo.getPopular(20),
  })

  const { play, togglePlayPause, currentStation, playerState } = usePlayer()
  const { isFavorite, toggleFavorite } = useFavorites()

  const handleToggleFavorite = (station: any) => {
    toggleFavorite(station)
    setFavoritesState(prev => prev + 1) // Force re-render
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
    <main id="main-content" className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Language Selector */}
        <header className="mb-8 flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-2">
              🎵 {t('app.title')}
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              {t('app.subtitle')}
            </p>
          </div>
          <div className="ml-4">
            <LanguageSelector />
          </div>
        </header>

        {/* Premium Banner - Commented for ads-only phase
        <div className="mb-8">
          <PremiumBanner placement="home" dismissible />
        </div>
        */}

        {/* Popular Stations Section */}
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
            {t('stations.popular')}
          </h2>

          {isLoading && <LoadingSpinner message={t('stations.loadingStations')} />}

          {error && (
            <EmptyState
              icon="⚠️"
              title={t('stations.errorLoading')}
              description={t('stations.errorDescription')}
              actionLabel={t('common.retry')}
              onAction={() => window.location.reload()}
            />
          )}

          {stations && stations.length === 0 && (
            <EmptyState
              icon="📻"
              title={t('stations.noStations')}
              description={t('stations.noStationsDescription')}
            />
          )}

          {stations && stations.length > 0 && (
            <div className="space-y-3">
              {stations.map((station) => (
                <StationCard
                  key={station.id}
                  station={station}
                  isPlaying={currentStation?.id === station.id && playerState.isPlaying}
                  isBuffering={currentStation?.id === station.id && playerState.isBuffering}
                  isFavorite={isFavorite(station.id)}
                  onPlay={() => handlePlay(station)}
                  onFavorite={() => handleToggleFavorite(station)}
                />
              ))}
            </div>
          )}
        </section>

        {/* SEO Content Section */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
            {t('seo.whyChooseUs.title')}
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <span>🎵</span> {t('seo.features.variety.title')}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t('seo.features.variety.description')}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <span>🌍</span> {t('seo.features.global.title')}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t('seo.features.global.description')}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <span>💯</span> {t('seo.features.free.title')}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t('seo.features.free.description')}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                <span>📱</span> {t('seo.features.anywhere.title')}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t('seo.features.anywhere.description')}
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-6">
            {t('seo.faq.title')}
          </h2>
          
          <FAQSection />
        </section>
      </div>
    </main>
  )
}

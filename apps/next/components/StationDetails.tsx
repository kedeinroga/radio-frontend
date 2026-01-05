'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { StationDTO } from '@radio-app/app'
import { Station } from '@radio-app/app'
import { StationImage } from './StationImage'
import { PlayStationButton } from './PlayStationButton'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useFavorites } from '@/hooks/useFavorites'

interface StationDetailsProps {
  station: StationDTO
}

export function StationDetails({ station }: StationDetailsProps) {
  const { t } = useAppTranslation()
  const router = useRouter()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [isFav, setIsFav] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Sincronizar el estado de favorito después de la hidratación
  useEffect(() => {
    setIsClient(true)
    setIsFav(isFavorite(station.id))
  }, [station.id, isFavorite])

  const handleToggleFavorite = () => {
    const stationEntity = new Station(
      station.id,
      station.name,
      station.streamUrl,
      station.slug,
      station.tags,
      station.seoMetadata,
      station.imageUrl,
      station.country,
      station.primaryGenre,
      false,
      station.seoMetadata?.description,
      station.bitrate,
      station.votes
    )
    toggleFavorite(stationEntity)
    setIsFav(!isFav)
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <>
      {/* Back and Favorite Buttons */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label={t('common.back')}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {t('common.back')}
        </button>

        {isClient && (
          <button
            onClick={handleToggleFavorite}
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isFav
                ? 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/30'
                : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
            aria-label={isFav ? t('favorites.removeFromFavorites') : t('favorites.addToFavorites')}
          >
            <svg
              className="w-5 h-5"
              fill={isFav ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {isFav ? t('favorites.removeFromFavorites') : t('favorites.addToFavorites')}
          </button>
        )}
      </div>

      {/* Station Hero Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Station Image */}
          <div className="flex-shrink-0">
            <StationImage
              src={station.imageUrl}
              alt={station.name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover shadow-md"
              loading="eager"
            />
          </div>

          {/* Station Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {station.name}
            </h1>
            
            {station.seoMetadata?.description && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                {station.seoMetadata.description}
              </p>
            )}

            {/* Metadata Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {station.country && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  📍 {station.country}
                </span>
              )}
              {station.bitrate && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  🎵 {station.bitrate}kbps
                </span>
              )}
              {station.votes && station.votes > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  ⭐ {station.votes} {station.votes === 1 ? t('stations.vote') : t('stations.votes')}
                </span>
              )}
            </div>

            {/* Genre Tags */}
            {station.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {station.tags.map((tag: string) => (
                  <a
                    key={tag}
                    href={`/genre/${tag.toLowerCase()}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    #{tag}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Play Button Section */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <PlayStationButton station={{
            id: station.id,
            name: station.name,
            streamUrl: station.streamUrl,
            slug: station.slug,
            imageUrl: station.imageUrl,
            country: station.country
          }} />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {t('stations.clickToListen')}
          </p>
        </div>
      </div>

      {/* Alternate Names (if available) */}
      {station.seoMetadata?.alternateNames && station.seoMetadata.alternateNames.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>{t('stations.alsoKnownAs')}:</strong>{' '}
            {station.seoMetadata.alternateNames.join(', ')}
          </p>
        </div>
      )}

      {/* Additional SEO Content */}
      <div className="mt-8 prose dark:prose-invert max-w-none">
        <h2>{t('stations.about', { name: station.name })}</h2>
        <p>
          {station.name} {t('stations.isA')} {station.country ? `${t('stations.from')} ${station.country}` : t('stations.international')}
          {station.primaryGenre && ` ${t('stations.specializedIn')} ${station.primaryGenre}`}.{' '}
          {t('stations.listen24h')} {station.bitrate ? `${station.bitrate}kbps` : t('stations.premium')}.
        </p>
        
        {station.tags.length > 0 && (
          <>
            <h3>{t('stations.genresAndCategories')}</h3>
            <p>
              {t('stations.genresDescription', { genres: station.tags.join(', ') })}
            </p>
          </>
        )}
      </div>
    </>
  )
}

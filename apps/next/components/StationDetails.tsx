'use client'

import type { StationDTO } from '@radio-app/app'
import { StationImage } from './StationImage'
import { PlayStationButton } from './PlayStationButton'
import { useAppTranslation } from '@/hooks/useAppTranslation'

interface StationDetailsProps {
  station: StationDTO
}

export function StationDetails({ station }: StationDetailsProps) {
  const { t } = useAppTranslation()

  return (
    <>
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

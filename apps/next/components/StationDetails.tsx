'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { StationDTO } from '@radio-app/app'
import { Station } from '@radio-app/app'
import { StationImage } from './StationImage'
import { PlayStationButton } from './PlayStationButton'
import { useAppTranslation } from '@/hooks/useAppTranslation'
import { useFavorites } from '@/hooks/useFavorites'
import { ArrowLeft, Heart, MapPin, Wifi, Star, Radio } from 'lucide-react'

interface StationDetailsProps {
  station: StationDTO
}

export function StationDetails({ station }: StationDetailsProps) {
  const { t } = useAppTranslation()
  const router = useRouter()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [isFav, setIsFav] = useState(false)
  const [isClient, setIsClient] = useState(false)

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

  return (
    <div className="min-h-screen">

      {/* ── Top navigation ─────────────────────────────────── */}
      <div
        className="flex justify-between items-center mb-5 animate-fade-in"
        style={{ animationDelay: '0ms' }}
      >
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 font-broadcast text-xs text-neutral-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.07] rounded-xl transition-all duration-200 focus:outline-none"
          aria-label={t('common.back')}
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          {t('common.back')}
        </button>

        {isClient && (
          <button
            onClick={handleToggleFavorite}
            className={`
              inline-flex items-center gap-2 px-4 py-2 font-broadcast text-xs rounded-xl border transition-all duration-200 focus:outline-none
              ${isFav
                ? 'text-rose-400 bg-rose-500/[0.10] border-rose-500/25 hover:bg-rose-500/[0.18]'
                : 'text-neutral-400 hover:text-white bg-white/[0.05] hover:bg-white/[0.09] border-white/[0.07]'
              }
            `}
            aria-label={isFav ? t('favorites.removeFromFavorites') : t('favorites.addToFavorites')}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-all ${isFav ? 'fill-rose-500 text-rose-500' : ''}`}
              aria-hidden="true"
            />
            {isFav ? t('favorites.removeFromFavorites') : t('favorites.addToFavorites')}
          </button>
        )}
      </div>

      {/* ── Hero stage ─────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-3xl mb-5 animate-fade-in"
        style={{ animationDelay: '50ms' }}
      >
        {/* Atmospheric blurred backdrop from station art */}
        {station.imageUrl && (
          <div
            className="absolute inset-0 scale-125"
            style={{
              backgroundImage: `url(${station.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(56px) saturate(1.6) brightness(0.7)',
            }}
            aria-hidden="true"
          />
        )}

        {/* Dark vignette overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(13,13,18,0.45) 0%, rgba(13,13,18,0.7) 35%, rgba(13,13,18,0.97) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Subtle decorative signal SVG — top right */}
        <svg
          className="absolute top-5 right-6 opacity-[0.07]"
          width="72"
          height="48"
          viewBox="0 0 72 48"
          fill="none"
          aria-hidden="true"
        >
          <line x1="0" y1="24" x2="72" y2="24" stroke="white" strokeWidth="1" />
          <line x1="0" y1="14" x2="48" y2="14" stroke="white" strokeWidth="1" strokeDasharray="5 4" />
          <line x1="0" y1="34" x2="60" y2="34" stroke="white" strokeWidth="1" strokeDasharray="7 5" />
          <circle cx="64" cy="24" r="3" stroke="white" strokeWidth="1" />
        </svg>

        {/* Hero content — centered */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-12 pb-10">

          {/* Station logo */}
          <div
            className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden mb-6 shadow-[0_12px_48px_rgba(0,0,0,0.7)] ring-2 ring-white/[0.09] animate-fade-up"
            style={{ animationDelay: '120ms' }}
          >
            <StationImage
              src={station.imageUrl}
              alt={station.name}
              width={160}
              height={160}
              priority
              className="w-full h-full object-cover"
              sizes="160px"
            />
          </div>

          {/* Station name */}
          <h1
            className="font-display text-4xl md:text-5xl font-bold text-white leading-tight mb-3 animate-fade-up"
            style={{ animationDelay: '170ms' }}
          >
            {station.name}
          </h1>

          {/* Metadata strip */}
          <div
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-4 animate-fade-up"
            style={{ animationDelay: '210ms' }}
          >
            {station.country && (
              <span className="flex items-center gap-1.5 font-broadcast text-[11px] text-neutral-400">
                <MapPin className="w-3 h-3 text-amber-500 flex-shrink-0" aria-hidden="true" />
                {station.country}
              </span>
            )}
            {station.bitrate && (
              <span className="flex items-center gap-1.5 font-broadcast text-[11px] text-neutral-400">
                <Wifi className="w-3 h-3 text-amber-500 flex-shrink-0" aria-hidden="true" />
                {station.bitrate} kbps
              </span>
            )}
            {station.votes != null && station.votes > 0 && (
              <span className="flex items-center gap-1.5 font-broadcast text-[11px] text-neutral-400">
                <Star className="w-3 h-3 text-amber-500 flex-shrink-0" aria-hidden="true" />
                {station.votes.toLocaleString()}
              </span>
            )}
          </div>

          {/* Description */}
          {station.seoMetadata?.description && (
            <p
              className="text-sm text-neutral-400 max-w-md leading-relaxed mb-7 animate-fade-up"
              style={{ animationDelay: '250ms' }}
            >
              {station.seoMetadata.description}
            </p>
          )}

          {/* Play button */}
          <div
            className="w-full max-w-xs animate-fade-up"
            style={{ animationDelay: '290ms' }}
          >
            <PlayStationButton
              station={{
                id: station.id,
                name: station.name,
                streamUrl: station.streamUrl,
                slug: station.slug,
                imageUrl: station.imageUrl,
                country: station.country,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Genre tags ─────────────────────────────────────── */}
      {station.tags.length > 0 && (
        <div
          className="flex flex-wrap gap-2 mb-8 animate-fade-up"
          style={{ animationDelay: '340ms' }}
        >
          {station.tags.map((tag: string) => (
            <a
              key={tag}
              href={`/genre/${tag.toLowerCase()}`}
              className="font-broadcast text-[11px] px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.07] hover:border-amber-500/30 text-neutral-500 hover:text-amber-400 transition-all duration-200"
            >
              #{tag}
            </a>
          ))}
        </div>
      )}

      {/* ── Also known as ──────────────────────────────────── */}
      {station.seoMetadata?.alternateNames && station.seoMetadata.alternateNames.length > 0 && (
        <div
          className="flex items-start gap-3 bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3 mb-8 animate-fade-up"
          style={{ animationDelay: '380ms' }}
        >
          <Radio className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="font-broadcast text-[11px] text-neutral-500 leading-relaxed">
            <span className="text-neutral-400">{t('stations.alsoKnownAs')}:</span>{' '}
            {station.seoMetadata.alternateNames.join(' · ')}
          </p>
        </div>
      )}

      {/* ── About section ──────────────────────────────────── */}
      <div
        className="animate-fade-up"
        style={{ animationDelay: '420ms' }}
      >
        <h2 className="font-display text-2xl font-semibold text-white mb-4">
          {t('stations.about', { name: station.name })}
        </h2>
        <div className="space-y-4 text-sm text-neutral-500 leading-relaxed">
          <p>
            {station.name}{' '}
            {t('stations.isA')}{' '}
            {station.country
              ? `${t('stations.from')} ${station.country}`
              : t('stations.international')}
            {station.primaryGenre && ` ${t('stations.specializedIn')} ${station.primaryGenre}`}.{' '}
            {t('stations.listen24h')}{' '}
            {station.bitrate ? `${station.bitrate}kbps` : t('stations.premium')}.
          </p>
          {station.tags.length > 0 && (
            <p>
              <span className="text-neutral-400">{t('stations.genresAndCategories')}:</span>{' '}
              {t('stations.genresDescription', { genres: station.tags.join(', ') })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

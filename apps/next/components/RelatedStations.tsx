'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { StationDTO } from '@radio-app/app'
import { Radio } from 'lucide-react'

interface RelatedStationsProps {
  stations: StationDTO[]
  title?: string
  className?: string
}

/** Station thumbnail with error fallback */
function Thumbnail({ src, alt }: { src: string | null | undefined; alt: string }) {
  const [err, setErr] = useState(false)

  if (!err && src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover"
        onError={() => setErr(true)}
      />
    )
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-700 to-neutral-800">
      <Radio className="w-5 h-5 text-neutral-500" aria-hidden="true" />
    </div>
  )
}

/** Single related station card */
function RelatedCard({
  station,
  index,
}: {
  station: StationDTO
  index: number
}) {
  const primaryTag = station.tags[0]
  const secondaryTag = station.tags[1]

  return (
    <Link
      href={`/radio/${station.id}`}
      className="
        group relative flex items-center gap-3.5 p-3 rounded-xl
        bg-white/[0.04] hover:bg-white/[0.08]
        border border-white/[0.05] hover:border-amber-500/20
        transition-all duration-200
        hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)]
        animate-fade-up
        focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-neutral-950
      "
      style={{ animationDelay: `${460 + index * 45}ms` }}
      aria-label={`Escuchar ${station.name}`}
    >
      {/* Thumbnail */}
      <div className="
        relative w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden
        ring-1 ring-white/[0.07]
        group-hover:ring-amber-500/30 transition-all duration-200
      ">
        <Thumbnail src={station.imageUrl} alt={station.name} />

        {/* Blurred halo behind thumbnail for depth */}
        <div
          className="absolute inset-0 -z-10 scale-150 opacity-60"
          style={{
            backgroundImage: station.imageUrl ? `url(${station.imageUrl})` : undefined,
            backgroundSize: 'cover',
            filter: 'blur(12px)',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Station info */}
      <div className="flex-1 min-w-0">
        <p className="
          font-display text-sm font-semibold leading-snug truncate
          text-neutral-200 group-hover:text-amber-400 transition-colors duration-200
        ">
          {station.name}
        </p>

        <div className="flex items-center gap-2 mt-1">
          {station.country && (
            <span className="font-broadcast text-[10px] text-neutral-600 truncate">
              {station.country}
            </span>
          )}
        </div>
      </div>

      {/* Genre tags — stacked top-right */}
      {(primaryTag || secondaryTag) && (
        <div className="flex-shrink-0 flex flex-col gap-1 items-end">
          {primaryTag && (
            <span className="
              font-broadcast text-[9px] tracking-wider uppercase
              px-1.5 py-0.5 rounded
              bg-amber-500/10 text-amber-500/80 border border-amber-500/15
            ">
              {primaryTag}
            </span>
          )}
          {secondaryTag && (
            <span className="
              font-broadcast text-[9px] tracking-wider uppercase
              px-1.5 py-0.5 rounded
              bg-white/[0.05] text-neutral-600 border border-white/[0.05]
            ">
              {secondaryTag}
            </span>
          )}
        </div>
      )}
    </Link>
  )
}

export function RelatedStations({
  stations,
  title = 'Radios Similares',
  className = '',
}: RelatedStationsProps) {
  if (stations.length === 0) return null

  return (
    <section className={`mt-10 ${className}`} aria-label={title}>
      {/* Section divider header */}
      <div
        className="flex items-center gap-4 mb-6 animate-fade-up"
        style={{ animationDelay: '430ms' }}
      >
        <div className="flex-1 h-px bg-white/[0.06]" aria-hidden="true" />
        <h2 className="font-broadcast text-[11px] tracking-[0.2em] uppercase text-neutral-500 whitespace-nowrap">
          {title}
        </h2>
        <div className="flex-1 h-px bg-white/[0.06]" aria-hidden="true" />
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {stations.map((station, i) => (
          <RelatedCard key={station.id} station={station} index={i} />
        ))}
      </div>
    </section>
  )
}

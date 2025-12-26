'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { StationDTO } from '../../domain/entities/Station'

interface RelatedStationsProps {
  stations: StationDTO[]
  title?: string
  className?: string
}

/**
 * Station Image Component with error handling
 * Client component needed for onError event handler
 */
function StationImage({ src, alt }: { src: string | null | undefined, alt: string }) {
  const [imgError, setImgError] = useState(false)
  
  return (
    <img
      src={imgError || !src ? '/default-radio.png' : src}
      alt={alt}
      className="w-16 h-16 rounded-lg object-cover"
      loading="lazy"
      onError={() => setImgError(true)}
    />
  )
}

/**
 * Related Stations Component
 * Displays stations with similar tags for internal linking (SEO)
 * Simplified card version optimized for Next.js
 */
export function RelatedStations({ 
  stations, 
  title = "Radios Similares",
  className = ''
}: RelatedStationsProps) {
  if (stations.length === 0) return null

  return (
    <section className={`mt-8 ${className}`}>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stations.map(station => (
          <Link 
            key={station.id} 
            href={`/radio/${station.id}`}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              {station.imageUrl && (
                <StationImage 
                  src={station.imageUrl}
                  alt={station.name}
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                  {station.name}
                </h3>
                {station.country && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {station.country}
                  </p>
                )}
                {station.tags.length > 0 && (
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {station.tags.slice(0, 2).map(tag => (
                      <span 
                        key={tag}
                        className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}


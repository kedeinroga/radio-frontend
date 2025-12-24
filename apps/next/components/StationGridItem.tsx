'use client'

import { useState } from 'react'
import Link from 'next/link'

interface StationGridItemProps {
  station: {
    id: string
    name: string
    slug: string
    imageUrl?: string
    country?: string
    tags: string[]
  }
}

export function StationGridItem({ station }: StationGridItemProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <Link
      href={`/radio/${station.slug}`}
      className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-800 group"
    >
      <div className="flex flex-col items-center text-center">
        <img
          src={imgError || !station.imageUrl ? '/default-radio.png' : station.imageUrl}
          alt={station.name}
          className="w-20 h-20 rounded-lg object-cover mb-3 group-hover:scale-105 transition-transform"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">
          {station.name}
        </h3>
        {station.country && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            📍 {station.country}
          </p>
        )}
        {station.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap justify-center">
            {station.tags.slice(0, 2).map((tag: string) => (
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
    </Link>
  )
}

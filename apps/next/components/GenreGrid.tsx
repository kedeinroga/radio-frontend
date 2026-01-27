'use client'

import Link from 'next/link'

interface GenreGridProps {
  locale: string
}

const genres = [
  { id: 'rock', icon: '🎸', name: { es: 'Rock', en: 'Rock', fr: 'Rock', de: 'Rock' } },
  { id: 'pop', icon: '🎤', name: { es: 'Pop', en: 'Pop', fr: 'Pop', de: 'Pop' } },
  { id: 'jazz', icon: '🎷', name: { es: 'Jazz', en: 'Jazz', fr: 'Jazz', de: 'Jazz' } },
  { id: 'classical', icon: '🎻', name: { es: 'Clásica', en: 'Classical', fr: 'Classique', de: 'Klassik' } },
  { id: 'electronic', icon: '🎧', name: { es: 'Electrónica', en: 'Electronic', fr: 'Électronique', de: 'Elektronisch' } },
  { id: 'hiphop', icon: '🎤', name: { es: 'Hip Hop', en: 'Hip Hop', fr: 'Hip Hop', de: 'Hip Hop' } },
  { id: 'latin', icon: '💃', name: { es: 'Latina', en: 'Latin', fr: 'Latine', de: 'Lateinamerikanisch' } },
  { id: 'country', icon: '🤠', name: { es: 'Country', en: 'Country', fr: 'Country', de: 'Country' } },
  { id: 'news', icon: '📰', name: { es: 'Noticias', en: 'News', fr: 'Actualités', de: 'Nachrichten' } },
  { id: 'sports', icon: '⚽', name: { es: 'Deportes', en: 'Sports', fr: 'Sports', de: 'Sport' } },
  { id: 'talk', icon: '🎙️', name: { es: 'Talk Shows', en: 'Talk Shows', fr: 'Talk Shows', de: 'Talk Shows' } },
  { id: 'reggae', icon: '🇯🇲', name: { es: 'Reggae', en: 'Reggae', fr: 'Reggae', de: 'Reggae' } }
]

export function GenreGrid({ locale }: GenreGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {genres.map((genre) => (
        <Link
          key={genre.id}
          href={`/${locale}/search?genre=${genre.id}`}
          className="group bg-white dark:bg-gray-800 rounded-lg p-6 text-center hover:shadow-lg transition-all hover:scale-105 border border-gray-200 dark:border-gray-700"
        >
          <div className="text-4xl mb-2">{genre.icon}</div>
          <div className="font-semibold text-neutral-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {genre.name[locale as keyof typeof genre.name] || genre.name.es}
          </div>
        </Link>
      ))}
    </div>
  )
}

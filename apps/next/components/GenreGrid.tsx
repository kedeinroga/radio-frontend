import Link from 'next/link'
import { GENRE_HUBS } from '@/lib/editorial'

interface GenreGridProps {
  locale: string
}

/** Enlaces a las páginas hub de género (contenido editorial en lib/editorial). */
export function GenreGrid({ locale }: GenreGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {GENRE_HUBS.map((genre) => (
        <Link
          key={genre.slug}
          href={`/${locale}/genre/${genre.slug}`}
          className="group bg-white dark:bg-gray-800 rounded-lg p-6 text-center hover:shadow-lg transition-all hover:scale-105 border border-gray-200 dark:border-gray-700"
        >
          <div className="text-4xl mb-2" aria-hidden="true">{genre.emoji}</div>
          <div className="font-semibold text-neutral-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {genre.names[locale as keyof typeof genre.names] ?? genre.names.es}
          </div>
        </Link>
      ))}
    </div>
  )
}

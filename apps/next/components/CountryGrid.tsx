import Link from 'next/link'
import { COUNTRY_HUBS } from '@/lib/editorial'

interface CountryGridProps {
  locale: string
}

/** Enlaces a las páginas hub de país (contenido editorial en lib/editorial). */
export function CountryGrid({ locale }: CountryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {COUNTRY_HUBS.map((country) => (
        <Link
          key={country.slug}
          href={`/${locale}/country/${country.slug}`}
          className="group bg-white dark:bg-gray-800 rounded-lg p-6 text-center hover:shadow-lg transition-all hover:scale-105 border border-gray-200 dark:border-gray-700"
        >
          <div className="text-4xl mb-2" aria-hidden="true">{country.emoji}</div>
          <div className="font-semibold text-neutral-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {country.names[locale as keyof typeof country.names] ?? country.names.es}
          </div>
        </Link>
      ))}
    </div>
  )
}

'use client'

import Link from 'next/link'

interface CountryGridProps {
  locale: string
}

const countries = [
  { id: 'spain', flag: '🇪🇸', name: { es: 'España', en: 'Spain', fr: 'Espagne', de: 'Spanien' } },
  { id: 'mexico', flag: '🇲🇽', name: { es: 'México', en: 'Mexico', fr: 'Mexique', de: 'Mexiko' } },
  { id: 'usa', flag: '🇺🇸', name: { es: 'Estados Unidos', en: 'USA', fr: 'États-Unis', de: 'USA' } },
  { id: 'uk', flag: '🇬🇧', name: { es: 'Reino Unido', en: 'United Kingdom', fr: 'Royaume-Uni', de: 'Vereinigtes Königreich' } },
  { id: 'france', flag: '🇫🇷', name: { es: 'Francia', en: 'France', fr: 'France', de: 'Frankreich' } },
  { id: 'germany', flag: '🇩🇪', name: { es: 'Alemania', en: 'Germany', fr: 'Allemagne', de: 'Deutschland' } },
  { id: 'argentina', flag: '🇦🇷', name: { es: 'Argentina', en: 'Argentina', fr: 'Argentine', de: 'Argentinien' } },
  { id: 'colombia', flag: '🇨🇴', name: { es: 'Colombia', en: 'Colombia', fr: 'Colombie', de: 'Kolumbien' } },
  { id: 'brazil', flag: '🇧🇷', name: { es: 'Brasil', en: 'Brazil', fr: 'Brésil', de: 'Brasilien' } },
  { id: 'chile', flag: '🇨🇱', name: { es: 'Chile', en: 'Chile', fr: 'Chili', de: 'Chile' } },
  { id: 'peru', flag: '🇵🇪', name: { es: 'Perú', en: 'Peru', fr: 'Pérou', de: 'Peru' } },
  { id: 'italy', flag: '🇮🇹', name: { es: 'Italia', en: 'Italy', fr: 'Italie', de: 'Italien' } }
]

export function CountryGrid({ locale }: CountryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {countries.map((country) => (
        <Link
          key={country.id}
          href={`/${locale}/search?country=${country.id}`}
          className="group bg-white dark:bg-gray-800 rounded-lg p-6 text-center hover:shadow-lg transition-all hover:scale-105 border border-gray-200 dark:border-gray-700"
        >
          <div className="text-4xl mb-2">{country.flag}</div>
          <div className="font-semibold text-neutral-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {country.name[locale as keyof typeof country.name] || country.name.es}
          </div>
        </Link>
      ))}
    </div>
  )
}

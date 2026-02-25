import { Metadata } from 'next'
import {
  SEOApiRepository,
  GetPopularCountries,
  Breadcrumbs,
  WebSiteSchema,
  Station
} from '@radio-app/app'
import { StationServerRepository } from '@/lib/repositories/StationServerRepository'
import { StationGridItem } from '@/components/StationGridItem'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'

interface PageProps {
  params: Promise<{ countryCode: string; locale: string }>
}

// Removed: export const dynamic = 'force-dynamic'
// Not needed - page is already dynamic due to [countryCode] param and runtime data fetching
// ISR below will handle regeneration strategy

// Allow dynamic params to be generated on-demand
export const dynamicParams = true

// 🔥 ISR - Regenerate every hour (3600 seconds)
// Note: This is ignored when dynamic = 'force-dynamic'
export const revalidate = 3600

// Helper to get translated text based on locale
function getLocalizedCountryText(locale: string, countryName: string) {
  const texts: Record<string, any> = {
    es: {
      title: `Radios de ${countryName} en vivo | Escuchar online gratis`,
      description: `Descubre las mejores estaciones de radio de ${countryName}. Escucha música, noticias y entretenimiento en vivo. Gratis y sin descargas.`,
      keywords: [`radio ${countryName}`, `estaciones ${countryName}`, `radio online ${countryName}`, `música ${countryName}`],
      ogTitle: `Radios de ${countryName} | RadioApp`,
      ogDescription: `Las mejores estaciones de radio de ${countryName}`,
    },
    en: {
      title: `${countryName} Radio Stations live | Listen online free`,
      description: `Discover the best radio stations from ${countryName}. Listen to music, news and entertainment live. Free and no downloads.`,
      keywords: [`${countryName} radio`, `${countryName} stations`, `${countryName} online radio`, `${countryName} music`],
      ogTitle: `${countryName} Radio Stations | RadioApp`,
      ogDescription: `The best radio stations from ${countryName}`,
    },
    fr: {
      title: `Stations de radio ${countryName} en direct | Écouter en ligne gratuitement`,
      description: `Découvrez les meilleures stations de radio de ${countryName}. Écoutez de la musique, des actualités et du divertissement en direct. Gratuit et sans téléchargement.`,
      keywords: [`radio ${countryName}`, `stations ${countryName}`, `radio en ligne ${countryName}`, `musique ${countryName}`],
      ogTitle: `Stations de radio ${countryName} | RadioApp`,
      ogDescription: `Les meilleures stations de radio de ${countryName}`,
    },
    de: {
      title: `${countryName} Radiosender live | Kostenlos online hören`,
      description: `Entdecken Sie die besten Radiosender aus ${countryName}. Hören Sie Musik, Nachrichten und Unterhaltung live. Kostenlos und ohne Downloads.`,
      keywords: [`${countryName} Radio`, `${countryName} Sender`, `${countryName} Online-Radio`, `${countryName} Musik`],
      ogTitle: `${countryName} Radiosender | RadioApp`,
      ogDescription: `Die besten Radiosender aus ${countryName}`,
    },
  }
  return texts[locale] || texts['es']
}

// 🔥 DYNAMIC METADATA
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const { countryCode, locale } = resolvedParams
  const countryName = decodeURIComponent(countryCode).toUpperCase()
  const localizedText = getLocalizedCountryText(locale, countryName)
  
  return {
    title: localizedText.title,
    description: localizedText.description,
    keywords: localizedText.keywords,
    openGraph: {
      title: localizedText.ogTitle,
      description: localizedText.ogDescription,
      url: `${BASE_URL}/${locale}/country/${countryCode}`,
      locale: locale === 'es' ? 'es_ES' : locale === 'en' ? 'en_US' : locale === 'fr' ? 'fr_FR' : 'de_DE',
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}/country/${countryCode}`,
      languages: {
        'es': `${BASE_URL}/es/country/${countryCode}`,
        'en': `${BASE_URL}/en/country/${countryCode}`,
        'fr': `${BASE_URL}/fr/country/${countryCode}`,
        'de': `${BASE_URL}/de/country/${countryCode}`,
        'x-default': `${BASE_URL}/es/country/${countryCode}`,
      },
    }
  }
}

// 🔥 SERVER COMPONENT WITH ISR
export default async function CountryPage({ params }: PageProps) {
  const { countryCode } = await Promise.resolve(params)
  
  // CRITICAL: Skip rendering during build phase to prevent crashes
  // This prevents API calls during "Collecting page data" in Vercel builds
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
        <div className="container mx-auto">
          <p>Loading country...</p>
        </div>
      </main>
    )
  }
  
  // Don't try to render if API is not available
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-2xl font-bold mb-4">API Not Configured</h1>
          <p>Please configure NEXT_PUBLIC_API_URL environment variable.</p>
        </div>
      </main>
    )
  }
  
  const repository = new StationServerRepository()
  const countryName = decodeURIComponent(countryCode).toUpperCase()
  
  let stations: Station[] = []
  try {
    stations = await repository.getByCountry(countryCode, 50)
  } catch (error) {

  }

  const breadcrumbs = [
    { name: 'Inicio', url: BASE_URL },
    { name: 'Países', url: `${BASE_URL}/countries` },
    { name: countryName, url: `${BASE_URL}/country/${countryCode}` }
  ]

  return (
    <>
      <WebSiteSchema
        name="RadioApp"
        url={BASE_URL}
        description="Escucha radio online gratis"
        searchActionTarget={`${BASE_URL}/search?q={search_term_string}`}
      />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Breadcrumbs items={breadcrumbs} />

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              🌍 Radios de {countryName}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {stations.length > 0 
                ? `Descubre ${stations.length} estaciones de radio de ${countryName}` 
                : `Cargando estaciones de ${countryName}...`}
            </p>
          </div>

          {/* Stations Grid */}
          {stations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stations.map(station => (
                <StationGridItem
                  key={station.id}
                  station={{
                    id: station.id,
                    name: station.name,
                    slug: station.slug,
                    imageUrl: station.imageUrl,
                    country: station.country,
                    tags: station.tags
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No se encontraron estaciones para {countryName}
              </p>
            </div>
          )}

          {/* SEO Content */}
          <div className="mt-12 prose dark:prose-invert max-w-none">
            <h2>Sobre las radios de {countryName}</h2>
            <p>
              En RadioApp encontrarás las mejores estaciones de radio de {countryName}. 
              Escucha en vivo música, noticias, deportes y entretenimiento las 24 horas del día. 
              Todas las estaciones son gratuitas y no requieren descargas.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

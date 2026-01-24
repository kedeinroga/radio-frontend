import { Metadata } from 'next'
import Link from 'next/link'
import { 
  StationApiRepository,
  SEOApiRepository,
  GetPopularTags,
  Breadcrumbs,
  WebSiteSchema,
  Station
} from '@radio-app/app'
import { StationGridItem } from '@/components/StationGridItem'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'

interface PageProps {
  params: Promise<{ tag: string; locale: string }> | { tag: string; locale: string }
}

// Force dynamic rendering - don't try to pre-render during build
export const dynamic = 'force-dynamic'

// Allow dynamic params to be generated on-demand
export const dynamicParams = true

// 🔥 ISR - Regenerate every hour
// Note: This is ignored when dynamic = 'force-dynamic'
export const revalidate = 3600

// Helper to get translated text based on locale
function getLocalizedGenreText(locale: string, genreName: string, displayName: string) {
  const texts: Record<string, any> = {
    es: {
      title: `Radios de ${displayName} | Escuchar música ${displayName} online gratis`,
      description: `Las mejores estaciones de radio de ${displayName}. Escucha ${displayName} en vivo las 24 horas. Música, programas y más, gratis.`,
      keywords: [`radio ${genreName}`, `música ${genreName}`, `${genreName} online`, `estaciones ${genreName}`],
      ogTitle: `Radios de ${displayName} | RadioApp`,
      ogDescription: `Escucha las mejores radios de ${displayName} en vivo`,
    },
    en: {
      title: `${displayName} Radio Stations | Listen to ${displayName} music online free`,
      description: `The best ${displayName} radio stations. Listen to ${displayName} live 24 hours. Music, shows and more, free.`,
      keywords: [`${genreName} radio`, `${genreName} music`, `${genreName} online`, `${genreName} stations`],
      ogTitle: `${displayName} Radio Stations | RadioApp`,
      ogDescription: `Listen to the best ${displayName} radio stations live`,
    },
    fr: {
      title: `Stations de radio ${displayName} | Écouter musique ${displayName} en ligne gratuitement`,
      description: `Les meilleures stations de radio ${displayName}. Écoutez ${displayName} en direct 24 heures. Musique, émissions et plus, gratuit.`,
      keywords: [`radio ${genreName}`, `musique ${genreName}`, `${genreName} en ligne`, `stations ${genreName}`],
      ogTitle: `Stations de radio ${displayName} | RadioApp`,
      ogDescription: `Écoutez les meilleures stations de radio ${displayName} en direct`,
    },
    de: {
      title: `${displayName} Radiosender | ${displayName} Musik kostenlos online hören`,
      description: `Die besten ${displayName} Radiosender. Hören Sie ${displayName} 24 Stunden live. Musik, Sendungen und mehr, kostenlos.`,
      keywords: [`${genreName} Radio`, `${genreName} Musik`, `${genreName} online`, `${genreName} Sender`],
      ogTitle: `${displayName} Radiosender | RadioApp`,
      ogDescription: `Hören Sie die besten ${displayName} Radiosender live`,
    },
  }
  return texts[locale] || texts['es']
}

// 🔥 DYNAMIC METADATA
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const { tag, locale } = resolvedParams
  const genreName = decodeURIComponent(tag).replace(/-/g, ' ')
  const displayName = genreName.charAt(0).toUpperCase() + genreName.slice(1)
  const localizedText = getLocalizedGenreText(locale, genreName, displayName)
  
  return {
    title: localizedText.title,
    description: localizedText.description,
    keywords: localizedText.keywords,
    openGraph: {
      title: localizedText.ogTitle,
      description: localizedText.ogDescription,
      url: `${BASE_URL}/${locale}/genre/${tag}`,
      locale: locale === 'es' ? 'es_ES' : locale === 'en' ? 'en_US' : locale === 'fr' ? 'fr_FR' : 'de_DE',
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}/genre/${tag}`,
      languages: {
        'es': `${BASE_URL}/es/genre/${tag}`,
        'en': `${BASE_URL}/en/genre/${tag}`,
        'fr': `${BASE_URL}/fr/genre/${tag}`,
        'de': `${BASE_URL}/de/genre/${tag}`,
        'x-default': `${BASE_URL}/es/genre/${tag}`,
      },
    }
  }
}

// 🔥 SERVER COMPONENT WITH ISR
export default async function GenrePage({ params }: PageProps) {
  const { tag } = await Promise.resolve(params)
  
  // Don't try to render during build if API is not available
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
  
  const repository = new StationApiRepository()
  const genreName = decodeURIComponent(tag).replace(/-/g, ' ')
  const displayName = genreName.charAt(0).toUpperCase() + genreName.slice(1)
  
  let stations: Station[] = []
  try {
    stations = await repository.search(genreName, 50)
  } catch (error) {

  }

  const breadcrumbs = [
    { name: 'Inicio', url: BASE_URL },
    { name: 'Géneros', url: `${BASE_URL}/genres` },
    { name: displayName, url: `${BASE_URL}/genre/${tag}` }
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
            <div className="flex items-center gap-3 mb-4">
              <span className="text-5xl">🎵</span>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Radios de {displayName}
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {stations.length > 0 
                ? `${stations.length} estaciones de ${displayName} disponibles` 
                : `Buscando estaciones de ${displayName}...`}
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
                No se encontraron estaciones de {displayName}
              </p>
              <Link 
                href="/search"
                className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline"
              >
                Buscar otras estaciones →
              </Link>
            </div>
          )}

          {/* SEO Content */}
          <div className="mt-12 prose dark:prose-invert max-w-none">
            <h2>Radio {displayName} Online Gratis</h2>
            <p>
              Descubre las mejores estaciones de radio de {displayName} en RadioApp. 
              Escucha tu música favorita de {displayName} en vivo, sin interrupciones 
              y completamente gratis. No necesitas descargar nada, solo dale play y 
              disfruta de la mejor programación de {displayName}.
            </p>
            
            <h3>¿Por qué escuchar radio de {displayName}?</h3>
            <ul>
              <li>Transmisión en vivo las 24 horas del día</li>
              <li>Sin publicidad intrusiva ni interrupciones molestas</li>
              <li>Calidad de audio optimizada para streaming</li>
              <li>Acceso desde cualquier dispositivo: móvil, tablet o computadora</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  )
}

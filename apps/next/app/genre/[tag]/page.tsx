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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://radioapp.com'

interface PageProps {
  params: { tag: string }
}

// 🔥 ISR - Regenerate every hour
export const revalidate = 3600

// 🔥 GENERATE STATIC PATHS FOR TOP GENRES
export async function generateStaticParams() {
  const seoRepository = new SEOApiRepository()
  const getPopularTags = new GetPopularTags(seoRepository)
  
  try {
    const tags = await getPopularTags.execute(100)
    
    return tags.map(tag => ({
      tag: tag.urlSlug
    }))
  } catch (error) {
    console.error('Error generating genre params:', error)
    return []
  }
}

// 🔥 DYNAMIC METADATA
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const genreName = decodeURIComponent(params.tag).replace(/-/g, ' ')
  const displayName = genreName.charAt(0).toUpperCase() + genreName.slice(1)
  
  return {
    title: `Radios de ${displayName} | Escuchar música ${displayName} online gratis`,
    description: `Las mejores estaciones de radio de ${displayName}. Escucha ${displayName} en vivo las 24 horas. Música, programas y más, gratis.`,
    keywords: [
      `radio ${genreName}`,
      `música ${genreName}`,
      `${genreName} online`,
      `estaciones ${genreName}`
    ],
    openGraph: {
      title: `Radios de ${displayName} | RadioApp`,
      description: `Escucha las mejores radios de ${displayName} en vivo`,
      url: `${BASE_URL}/genre/${params.tag}`,
    },
    alternates: {
      canonical: `${BASE_URL}/genre/${params.tag}`
    }
  }
}

// 🔥 SERVER COMPONENT WITH ISR
export default async function GenrePage({ params }: PageProps) {
  const repository = new StationApiRepository()
  const genreName = decodeURIComponent(params.tag).replace(/-/g, ' ')
  const displayName = genreName.charAt(0).toUpperCase() + genreName.slice(1)
  
  let stations: Station[] = []
  try {
    stations = await repository.search(genreName, 50)
  } catch (error) {
    console.error('Error fetching stations:', error)
  }

  const breadcrumbs = [
    { name: 'Inicio', url: BASE_URL },
    { name: 'Géneros', url: `${BASE_URL}/genres` },
    { name: displayName, url: `${BASE_URL}/genre/${params.tag}` }
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
                <Link
                  key={station.id}
                  href={`/radio/${station.slug}`}
                  className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-800 group"
                >
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={station.imageUrl || '/default-radio.png'}
                      alt={station.name}
                      className="w-20 h-20 rounded-lg object-cover mb-3 group-hover:scale-105 transition-transform"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = '/default-radio.png'
                      }}
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

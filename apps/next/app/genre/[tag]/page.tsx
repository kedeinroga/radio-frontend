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
import { StationGridItem } from '../../../components/StationGridItem'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://radioapp.com'

interface PageProps {
  params: Promise<{ tag: string }>
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
  const { tag } = await params
  const genreName = decodeURIComponent(tag).replace(/-/g, ' ')
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
      url: `${BASE_URL}/genre/${tag}`,
    },
    alternates: {
      canonical: `${BASE_URL}/genre/${tag}`
    }
  }
}

// 🔥 SERVER COMPONENT WITH ISR
export default async function GenrePage({ params }: PageProps) {
  const { tag } = await params
  const repository = new StationApiRepository()
  const genreName = decodeURIComponent(tag).replace(/-/g, ' ')
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

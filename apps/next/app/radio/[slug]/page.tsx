import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { 
  StationApiRepository,
  GetRelatedStations,
  RadioStationSchema,
  RelatedStations
} from '@radio-app/app'
import { StationImage } from '../../../components/StationImage'
import { PlayStationButton } from '../../../components/PlayStationButton'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://radioapp.com'

interface PageProps {
  params: Promise<{ slug: string }>
}

// 🔥 DYNAMIC METADATA FOR SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const repository = new StationApiRepository()
  const station = await repository.findBySlugOrId(slug)

  if (!station) {
    return {
      title: 'Estación No Encontrada',
      description: 'La estación de radio que buscas no existe o ha sido eliminada.'
    }
  }

  const metadata = station.seoMetadata

  return {
    title: metadata?.title || `${station.name} en vivo | Escuchar ${station.primaryGenre || 'Radio'} online`,
    description: metadata?.description || `Escucha ${station.name} desde ${station.country}. ${station.tags.join(', ')}.`,
    keywords: metadata?.keywords || station.tags,
    openGraph: {
      title: metadata?.title || station.name,
      description: metadata?.description || `Escucha ${station.name} en vivo`,
      images: [metadata?.imageUrl || station.imageUrl || '/default-radio.png'],
      url: metadata?.canonicalUrl || `${BASE_URL}/radio/${station.slug}`,
      type: 'website',
      siteName: 'RadioApp',
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata?.title || station.name,
      description: metadata?.description,
      images: [metadata?.imageUrl || station.imageUrl || '/default-radio.png'],
    },
    alternates: {
      canonical: metadata?.canonicalUrl || `${BASE_URL}/radio/${station.slug}`
    },
    other: {
      'last-modified': metadata?.lastModified || new Date().toISOString()
    }
  }
}

// 🔥 SERVER COMPONENT - SSR RENDERING
export default async function RadioStationPage({ params }: PageProps) {
  const { slug } = await params
  const repository = new StationApiRepository()
  const station = await repository.findBySlugOrId(slug)

  if (!station) {
    notFound()
  }

  // Fetch related stations for internal linking
  const relatedStationsUseCase = new GetRelatedStations(repository)
  const relatedStations = await relatedStationsUseCase.execute(station, 6)

  return (
    <>
      {/* JSON-LD Schema for Google Rich Results */}
      <RadioStationSchema station={station} baseUrl={BASE_URL} />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Station Hero Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Station Image */}
              <div className="flex-shrink-0">
                <StationImage
                  src={station.imageUrl}
                  alt={station.name}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-xl object-cover shadow-md"
                  loading="eager"
                />
              </div>

              {/* Station Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {station.name}
                </h1>
                
                {station.seoMetadata?.description && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                    {station.seoMetadata.description}
                  </p>
                )}

                {/* Metadata Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {station.country && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                      📍 {station.country}
                    </span>
                  )}
                  {station.bitrate && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                      🎵 {station.bitrate}kbps
                    </span>
                  )}
                  {station.votes && station.votes > 0 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                      ⭐ {station.votes} votos
                    </span>
                  )}
                </div>

                {/* Genre Tags */}
                {station.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {station.tags.map((tag: string) => (
                      <a
                        key={tag}
                        href={`/genre/${tag.toLowerCase()}`}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                      >
                        #{tag}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Play Button Section */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <PlayStationButton station={{
                id: station.id,
                name: station.name,
                streamUrl: station.streamUrl,
                slug: station.slug,
                imageUrl: station.imageUrl,
                country: station.country
              }} />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Haz clic para escuchar en vivo
              </p>
            </div>
          </div>

          {/* Alternate Names (if available) */}
          {station.seoMetadata?.alternateNames && station.seoMetadata.alternateNames.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 mb-8">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>También conocida como:</strong>{' '}
                {station.seoMetadata.alternateNames.join(', ')}
              </p>
            </div>
          )}

          {/* Related Stations - Internal Linking for SEO */}
          <RelatedStations stations={relatedStations.map(s => s.toJSON())} />

          {/* Additional SEO Content */}
          <div className="mt-8 prose dark:prose-invert max-w-none">
            <h2>Sobre {station.name}</h2>
            <p>
              {station.name} es una estación de radio {station.country ? `de ${station.country}` : 'internacional'} 
              {station.primaryGenre ? ` especializada en ${station.primaryGenre}` : ''}. 
              Escucha en vivo las 24 horas del día con calidad {station.bitrate ? `${station.bitrate}kbps` : 'premium'}.
            </p>
            
            {station.tags.length > 0 && (
              <>
                <h3>Géneros y Categorías</h3>
                <p>
                  Esta estación transmite contenido de: {station.tags.join(', ')}. 
                  Encuentra más estaciones similares explorando nuestras categorías.
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

import { Metadata } from 'next'
import Link from 'next/link'
import { 
  StationApiRepository,
  SEOApiRepository,
  GetPopularCountries,
  Breadcrumbs,
  WebSiteSchema,
  Station
} from '@radio-app/app'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://radioapp.com'

interface PageProps {
  params: { countryCode: string }
}

// 🔥 ISR - Regenerate every hour (3600 seconds)
export const revalidate = 3600

// 🔥 GENERATE STATIC PATHS FOR TOP COUNTRIES
export async function generateStaticParams() {
  const seoRepository = new SEOApiRepository()
  const getPopularCountries = new GetPopularCountries(seoRepository)
  
  try {
    const countries = await getPopularCountries.execute(50)
    
    return countries.map(country => ({
      countryCode: country.urlSlug
    }))
  } catch (error) {
    console.error('Error generating country params:', error)
    return []
  }
}

// 🔥 DYNAMIC METADATA
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const countryName = decodeURIComponent(params.countryCode).toUpperCase()
  
  return {
    title: `Radios de ${countryName} en vivo | Escuchar online gratis`,
    description: `Descubre las mejores estaciones de radio de ${countryName}. Escucha música, noticias y entretenimiento en vivo. Gratis y sin descargas.`,
    keywords: [
      `radio ${countryName}`,
      `estaciones ${countryName}`,
      `radio online ${countryName}`,
      `música ${countryName}`
    ],
    openGraph: {
      title: `Radios de ${countryName} | RadioApp`,
      description: `Las mejores estaciones de radio de ${countryName}`,
      url: `${BASE_URL}/country/${params.countryCode}`,
    },
    alternates: {
      canonical: `${BASE_URL}/country/${params.countryCode}`
    }
  }
}

// 🔥 SERVER COMPONENT WITH ISR
export default async function CountryPage({ params }: PageProps) {
  const repository = new StationApiRepository()
  const countryName = decodeURIComponent(params.countryCode).toUpperCase()
  
  let stations: Station[] = []
  try {
    stations = await repository.getByCountry(params.countryCode, 50)
  } catch (error) {
    console.error('Error fetching stations:', error)
  }

  const breadcrumbs = [
    { name: 'Inicio', url: BASE_URL },
    { name: 'Países', url: `${BASE_URL}/countries` },
    { name: countryName, url: `${BASE_URL}/country/${params.countryCode}` }
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

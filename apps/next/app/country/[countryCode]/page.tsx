import { Metadata } from 'next'
import { 
  StationApiRepository,
  SEOApiRepository,
  GetPopularCountries,
  Breadcrumbs,
  WebSiteSchema,
  Station
} from '@radio-app/app'
import { StationGridItem } from '../../../components/StationGridItem'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://radioapp.com'

interface PageProps {
  params: Promise<{ countryCode: string }>
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
  const { countryCode } = await params
  const countryName = decodeURIComponent(countryCode).toUpperCase()
  
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
      url: `${BASE_URL}/country/${countryCode}`,
    },
    alternates: {
      canonical: `${BASE_URL}/country/${countryCode}`
    }
  }
}

// 🔥 SERVER COMPONENT WITH ISR
export default async function CountryPage({ params }: PageProps) {
  const { countryCode } = await params
  const repository = new StationApiRepository()
  const countryName = decodeURIComponent(countryCode).toUpperCase()
  
  let stations: Station[] = []
  try {
    stations = await repository.getByCountry(countryCode, 50)
  } catch (error) {
    console.error('Error fetching stations:', error)
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

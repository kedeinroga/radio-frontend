import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { 
  StationApiRepository,
  GetRelatedStations,
  RadioStationSchema,
  RelatedStations,
  Station
} from '@radio-app/app'
import { StationDetails } from '@/components/StationDetails'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'

interface PageProps {
  params: Promise<{ id: string; locale: string }>
}

// Force dynamic rendering - don't try to pre-render during build
export const dynamic = 'force-dynamic'

// Helper to get translated text based on locale
function getLocalizedText(locale: string) {
  const texts: Record<string, any> = {
    es: {
      notFoundTitle: 'Estación No Encontrada',
      notFoundDescription: 'La estación de radio que buscas no existe o ha sido eliminada.',
      titleTemplate: (name: string, genre: string) => `${name} en vivo | Escuchar ${genre} online`,
      descriptionTemplate: (name: string, country: string, tags: string) => 
        `Escucha ${name} desde ${country}. ${tags}.`,
      ogDescriptionTemplate: (name: string) => `Escucha ${name} en vivo`,
    },
    en: {
      notFoundTitle: 'Station Not Found',
      notFoundDescription: 'The radio station you are looking for does not exist or has been removed.',
      titleTemplate: (name: string, genre: string) => `${name} live | Listen to ${genre} online`,
      descriptionTemplate: (name: string, country: string, tags: string) => 
        `Listen to ${name} from ${country}. ${tags}.`,
      ogDescriptionTemplate: (name: string) => `Listen to ${name} live`,
    },
    fr: {
      notFoundTitle: 'Station Non Trouvée',
      notFoundDescription: 'La station de radio que vous recherchez n\'existe pas ou a été supprimée.',
      titleTemplate: (name: string, genre: string) => `${name} en direct | Écouter ${genre} en ligne`,
      descriptionTemplate: (name: string, country: string, tags: string) => 
        `Écoutez ${name} depuis ${country}. ${tags}.`,
      ogDescriptionTemplate: (name: string) => `Écoutez ${name} en direct`,
    },
    de: {
      notFoundTitle: 'Sender Nicht Gefunden',
      notFoundDescription: 'Der gesuchte Radiosender existiert nicht oder wurde entfernt.',
      titleTemplate: (name: string, genre: string) => `${name} live | ${genre} online hören`,
      descriptionTemplate: (name: string, country: string, tags: string) => 
        `Hören Sie ${name} aus ${country}. ${tags}.`,
      ogDescriptionTemplate: (name: string) => `Hören Sie ${name} live`,
    },
  }
  return texts[locale] || texts['es']
}

// 🔥 DYNAMIC METADATA FOR SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, locale } = await params
  
  // ALWAYS return simple metadata to prevent API calls during build
  // Metadata will be generated properly at runtime
  const defaultMetadata = {
    title: 'Radio Station',
    description: 'Listen to your favorite radio station online',
  }
  
  // Don't try to fetch metadata if API is not available
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return defaultMetadata
  }
  
  // Wrap in try-catch to prevent any build crashes
  try {
    const repository = new StationApiRepository()
    const station = await repository.findById(id)
    
    if (!station) {
      const localizedText = getLocalizedText(locale)
      return {
        title: localizedText.notFoundTitle,
        description: localizedText.notFoundDescription
      }
    }

    const localizedText = getLocalizedText(locale)
    const metadata = station.seoMetadata
    const genre = station.primaryGenre || 'Radio'
    const tagsText = station.tags.join(', ')

    return {
      title: metadata?.title || localizedText.titleTemplate(station.name, genre),
      description: metadata?.description || localizedText.descriptionTemplate(station.name, station.country, tagsText),
      keywords: metadata?.keywords || station.tags,
      openGraph: {
        title: metadata?.title || station.name,
        description: metadata?.description || localizedText.ogDescriptionTemplate(station.name),
        images: [metadata?.imageUrl || station.imageUrl || '/default-radio.png'],
        url: metadata?.canonicalUrl || `${BASE_URL}/${locale}/radio/${station.id}`,
        type: 'website',
        siteName: 'RadioApp',
        locale: locale === 'es' ? 'es_ES' : locale === 'en' ? 'en_US' : locale === 'fr' ? 'fr_FR' : 'de_DE',
      },
      twitter: {
        card: 'summary_large_image',
        title: metadata?.title || station.name,
        description: metadata?.description || localizedText.ogDescriptionTemplate(station.name),
        images: [metadata?.imageUrl || station.imageUrl || '/default-radio.png'],
      },
      alternates: {
        canonical: `${BASE_URL}/${locale}/radio/${station.id}`,
        languages: {
          'es': `${BASE_URL}/es/radio/${station.id}`,
          'en': `${BASE_URL}/en/radio/${station.id}`,
          'fr': `${BASE_URL}/fr/radio/${station.id}`,
          'de': `${BASE_URL}/de/radio/${station.id}`,
          'x-default': `${BASE_URL}/es/radio/${station.id}`,
        },
      },
      other: {
        'last-modified': metadata?.lastModified || new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('[generateMetadata] Error fetching station:', error)
    return defaultMetadata
  }
}

// 🔥 SERVER COMPONENT - SSR RENDERING
export default async function RadioStationPage({ params }: PageProps) {
  const { id } = await params
  
  // Don't try to render during build if API is not available
  if (!process.env.NEXT_PUBLIC_API_URL) {
    notFound()
  }
  
  const repository = new StationApiRepository()
  let station
  try {
    station = await repository.findById(id)
  } catch (error) {
    console.error('[RadioStationPage] Error fetching station:', error)
    notFound()
  }

  if (!station) {
    notFound()
  }

  // Fetch related stations for internal linking
  const relatedStationsUseCase = new GetRelatedStations(repository)
  let relatedStations: Station[] = []
  try {
    relatedStations = await relatedStationsUseCase.execute(station, 6)
  } catch (error) {
    console.error('[RadioStationPage] Error fetching related stations:', error)
    // Continue without related stations
  }

  // Convert station entity to plain object for client component
  const stationData = station.toJSON()

  return (
    <>
      {/* JSON-LD Schema for Google Rich Results */}
      <RadioStationSchema station={station} baseUrl={BASE_URL} />

      <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Station Details */}
          <StationDetails station={stationData} />

          {/* Related Stations - Internal Linking for SEO */}
          <RelatedStations stations={relatedStations.map(s => s.toJSON())} />
        </div>
      </main>
    </>
  )
}

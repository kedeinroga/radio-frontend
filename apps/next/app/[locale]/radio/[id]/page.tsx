import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  GetRelatedStations,
  RadioStationSchema,
  RelatedStations,
  Station
} from '@radio-app/app'
import { StationServerRepository } from '@/lib/repositories/StationServerRepository'
import { StationDetails } from '@/components/StationDetails'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://rradio.online'

interface PageProps {
  params: Promise<{ id: string; locale: string }> | { id: string; locale: string }
}

// Force dynamic rendering - don't try to generate this page at build time
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
  const texts = getLocalizedText(locale)
  
  try {
    const repository = new StationServerRepository()
    const station = await repository.findById(id)
    
    if (!station) {
      return {
        title: texts.notFoundTitle,
        description: texts.notFoundDescription,
      }
    }

    const tags = station.tags.join(', ')
    const country = station.country || 'Online'
    const genre = station.tags[0] || 'Radio'

    return {
      title: texts.titleTemplate(station.name, genre),
      description: texts.descriptionTemplate(station.name, country, tags),
      openGraph: {
        title: station.name,
        description: texts.ogDescriptionTemplate(station.name),
        type: 'website',
        url: `${BASE_URL}/${locale}/radio/${id}`,
        images: station.imageUrl ? [
          {
            url: station.imageUrl,
            width: 256,
            height: 256,
            alt: station.name,
          },
        ] : [],
      },
      twitter: {
        card: 'summary',
        title: station.name,
        description: texts.ogDescriptionTemplate(station.name),
        images: station.imageUrl ? [station.imageUrl] : [],
      },
      alternates: {
        canonical: `${BASE_URL}/${locale}/radio/${id}`,
        languages: {
          'es': `${BASE_URL}/es/radio/${id}`,
          'en': `${BASE_URL}/en/radio/${id}`,
          'fr': `${BASE_URL}/fr/radio/${id}`,
          'de': `${BASE_URL}/de/radio/${id}`,
        },
      },
    }
  } catch (error) {
    console.error('[generateMetadata] Error:', error)
    return {
      title: 'Radio Station | Listen Online',
      description: 'Listen to your favorite radio station online with high quality streaming',
    }
  }
}

// 🔥 SERVER COMPONENT - SSR RENDERING
export default async function RadioStationPage({ params }: PageProps) {
  const { id } = await params
  
  const repository = new StationServerRepository()
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

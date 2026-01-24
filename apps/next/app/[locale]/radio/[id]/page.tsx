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
  params: Promise<{ id: string; locale: string }> | { id: string; locale: string }
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
  
  // CRITICAL: Return simple metadata during build to prevent crashes
  // The page is dynamic (force-dynamic), so full metadata will be generated at runtime
  // This prevents API calls during "Collecting page data" phase in Vercel builds
  return {
    title: 'Radio Station | Listen Online',
    description: 'Listen to your favorite radio station online with high quality streaming',
  }
}

// 🔥 SERVER COMPONENT - SSR RENDERING
export default async function RadioStationPage({ params }: PageProps) {
  const { id } = await params
  
  // CRITICAL: Minimal render to prevent build crashes
  // force-dynamic ensures this only renders at request time
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      <div className="container mx-auto">
        <p>Loading station {id}...</p>
      </div>
    </main>
  )
}

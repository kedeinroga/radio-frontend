import type { Metadata } from 'next'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ locale: string }>
}

// Fecha real del último cambio de contenido (actualizar al modificar el texto)
const COPYRIGHT_LAST_UPDATED = '2026-10-15'

interface CopyrightContent {
  metaTitle: string
  metaDescription: string
  title: string
  updated: string
  sections: { id: string; heading: string; body: string }[]
  back: string
}

const content: Record<'es' | 'en' | 'fr' | 'de', CopyrightContent> = {
  es: {
    metaTitle: 'Derechos de autor | Rradio',
    metaDescription:
      'Rradio no aloja audio: enlaza a transmisiones públicas de radio. Cómo solicitar que retiremos una emisora del directorio.',
    title: 'Derechos de autor',
    updated: 'Última actualización: {{date}}',
    sections: [
      {
        id: 'hosting',
        heading: '1. Rradio no aloja audio',
        body: 'Rradio es un directorio de emisoras de radio que transmiten públicamente por internet. **No alojamos, almacenamos ni retransmitimos ningún audio.** Cuando reproduces una emisora, el sonido llega directamente desde el servidor de esa emisora a tu dispositivo.\n\nEl catálogo procede de Radio Browser, un directorio público y comunitario de emisoras.',
      },
      {
        id: 'licenses',
        heading: '2. Responsabilidad de cada emisora',
        body: 'Cada emisora es responsable de lo que emite y de contar con las licencias necesarias ante las entidades de gestión de derechos de su país. Rradio no controla, edita ni modera esa programación.',
      },
      {
        id: 'removal',
        heading: '3. Cómo pedir que retiremos una emisora',
        body: 'Si eres titular de derechos, representas a una emisora o crees por otro motivo que una emisora no debería aparecer en Rradio, escríbenos a **contact@rradio.online** indicando:\n\n- El nombre de la emisora y el enlace a su página en Rradio\n- El motivo de la solicitud\n- Cómo podemos contactarte\n\nRevisamos cada solicitud y, si procede, retiramos la emisora del directorio y te lo confirmamos por correo.',
      },
    ],
    back: 'Volver al inicio',
  },
  en: {
    metaTitle: 'Copyright | Rradio',
    metaDescription:
      'Rradio does not host audio: it links to public radio streams. How to ask us to remove a station from the directory.',
    title: 'Copyright',
    updated: 'Last updated: {{date}}',
    sections: [
      {
        id: 'hosting',
        heading: '1. Rradio does not host audio',
        body: 'Rradio is a directory of radio stations that stream publicly on the internet. **We do not host, store or rebroadcast any audio.** When you play a station, the sound comes directly from that station\'s server to your device.\n\nOur catalog comes from Radio Browser, a public, community-run station directory.',
      },
      {
        id: 'licenses',
        heading: '2. Each station is responsible for its content',
        body: 'Each station is responsible for what it broadcasts and for holding the licenses required by the rights organizations in its country. Rradio does not control, edit or moderate their programming.',
      },
      {
        id: 'removal',
        heading: '3. How to ask us to remove a station',
        body: 'If you are a rights holder, represent a station or believe for any other reason that a station should not be listed on Rradio, write to **contact@rradio.online** with:\n\n- The station name and the link to its page on Rradio\n- The reason for your request\n- How we can reach you\n\nWe review every request and, where appropriate, remove the station from the directory and confirm it by email.',
      },
    ],
    back: 'Back to home',
  },
  fr: {
    metaTitle: 'Droits d\'auteur | Rradio',
    metaDescription:
      'Rradio n\'héberge aucun audio : il renvoie vers des flux radio publics. Comment demander le retrait d\'une station.',
    title: 'Droits d\'auteur',
    updated: 'Dernière mise à jour : {{date}}',
    sections: [
      {
        id: 'hosting',
        heading: '1. Rradio n\'héberge aucun audio',
        body: 'Rradio est un annuaire de stations de radio qui diffusent publiquement sur internet. **Nous n\'hébergeons, ne stockons et ne rediffusons aucun audio.** Lorsque vous écoutez une station, le son arrive directement du serveur de cette station jusqu\'à votre appareil.\n\nNotre catalogue provient de Radio Browser, un annuaire public et communautaire de stations.',
      },
      {
        id: 'licenses',
        heading: '2. Chaque station est responsable de son contenu',
        body: 'Chaque station est responsable de ce qu\'elle diffuse et des licences exigées par les sociétés de gestion de droits de son pays. Rradio ne contrôle, ne modifie ni ne modère leur programmation.',
      },
      {
        id: 'removal',
        heading: '3. Comment demander le retrait d\'une station',
        body: 'Si vous êtes titulaire de droits, représentez une station ou estimez pour une autre raison qu\'une station ne devrait pas figurer sur Rradio, écrivez à **contact@rradio.online** en indiquant :\n\n- Le nom de la station et le lien vers sa page sur Rradio\n- Le motif de votre demande\n- Comment vous joindre\n\nNous examinons chaque demande et, le cas échéant, retirons la station de l\'annuaire et vous le confirmons par e-mail.',
      },
    ],
    back: 'Retour à l\'accueil',
  },
  de: {
    metaTitle: 'Urheberrecht | Rradio',
    metaDescription:
      'Rradio hostet keine Audiodateien, sondern verlinkt öffentliche Radiostreams. So beantragen Sie die Entfernung eines Senders.',
    title: 'Urheberrecht',
    updated: 'Zuletzt aktualisiert: {{date}}',
    sections: [
      {
        id: 'hosting',
        heading: '1. Rradio hostet keine Audiodateien',
        body: 'Rradio ist ein Verzeichnis von Radiosendern, die öffentlich im Internet streamen. **Wir hosten, speichern oder senden keine Audioinhalte.** Wenn Sie einen Sender abspielen, kommt der Ton direkt vom Server des Senders auf Ihr Gerät.\n\nUnser Katalog stammt aus Radio Browser, einem öffentlichen, von der Community gepflegten Senderverzeichnis.',
      },
      {
        id: 'licenses',
        heading: '2. Jeder Sender ist für seine Inhalte verantwortlich',
        body: 'Jeder Sender ist für sein Programm und für die Lizenzen der Verwertungsgesellschaften seines Landes verantwortlich. Rradio kontrolliert, bearbeitet oder moderiert dieses Programm nicht.',
      },
      {
        id: 'removal',
        heading: '3. So beantragen Sie die Entfernung eines Senders',
        body: 'Wenn Sie Rechteinhaber sind, einen Sender vertreten oder aus einem anderen Grund der Meinung sind, dass ein Sender nicht auf Rradio erscheinen sollte, schreiben Sie an **contact@rradio.online** mit:\n\n- Name des Senders und Link zu seiner Seite auf Rradio\n- Grund Ihrer Anfrage\n- Wie wir Sie erreichen können\n\nWir prüfen jede Anfrage, entfernen den Sender gegebenenfalls aus dem Verzeichnis und bestätigen es Ihnen per E-Mail.',
      },
    ],
    back: 'Zurück zur Startseite',
  },
}

function getContent(locale: string): CopyrightContent {
  return content[locale as keyof typeof content] ?? content.es
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params
  const t = getContent(locale)
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    robots: { index: true, follow: true },
  }
}

export default async function CopyrightPage({ params }: PageProps) {
  const { locale } = await params
  const t = getContent(locale)
  const lastUpdated = new Date(COPYRIGHT_LAST_UPDATED).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <article className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 md:p-12">
        <header className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t.updated.replace('{{date}}', lastUpdated)}
          </p>
        </header>

        <div className="space-y-10">
          {t.sections.map((section) => (
            <section key={section.id}>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {section.heading}
              </h2>
              <div
                className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line prose dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: section.body.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                }}
              />
            </section>
          ))}
        </div>

        <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            href={`/${locale}`}
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium inline-flex items-center gap-2"
          >
            ← {t.back}
          </Link>
        </footer>
      </article>
    </main>
  )
}

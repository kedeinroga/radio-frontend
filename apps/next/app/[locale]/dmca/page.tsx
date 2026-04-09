import type { Metadata } from 'next'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ locale: string }> | { locale: string }
}

export const revalidate = 86400

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams.locale || 'es'

  return {
    title: locale === 'es'
      ? 'Aviso Legal y DMCA | Rradio'
      : 'Legal Notice & DMCA | Rradio',
    description: locale === 'es'
      ? 'Rradio no aloja contenido de audio. Solo enlazamos a transmisiones públicas de radio en internet. Información sobre derechos de autor y DMCA.'
      : 'Rradio does not host any audio content. We only link to publicly available radio streams on the internet. Copyright and DMCA information.',
    robots: { index: true, follow: true },
  }
}

const content = {
  es: {
    title: 'Aviso Legal y Política DMCA',
    updated: 'Última actualización: Abril 2025',
    sections: [
      {
        id: 'disclaimer',
        heading: '1. Exención de Responsabilidad sobre Contenido de Terceros',
        body: `Rradio es un directorio y agregador de estaciones de radio disponibles públicamente en internet. **Rradio no aloja, almacena, transmite ni reproduce ningún archivo de audio en sus propios servidores.**

Nuestro servicio únicamente proporciona enlaces (URLs) a transmisiones de radio en vivo que ya se encuentran disponibles de forma pública en internet y que son operadas y controladas por sus respectivas emisoras.

Al reproducir una estación, el audio es transmitido directamente desde los servidores de la emisora hacia tu dispositivo. Rradio actúa exclusivamente como intermediario de enlace, sin intervenir en el contenido transmitido.`,
      },
      {
        id: 'copyright',
        heading: '2. Derechos de Autor',
        body: `Rradio respeta la propiedad intelectual y los derechos de autor de terceros. El contenido de cada emisora de radio es responsabilidad exclusiva de dicha emisora y de las licencias que esta haya obtenido con organizaciones de gestión de derechos (como SGAE, ASCAP, BMI, SOCAN u otras equivalentes según el país).

Rradio no controla, edita ni modera el contenido emitido por las estaciones de radio y no asume responsabilidad alguna por dicho contenido.`,
      },
      {
        id: 'dmca',
        heading: '3. Política DMCA (Digital Millennium Copyright Act)',
        body: `Si usted es propietario de derechos de autor o actúa en nombre del propietario, y considera que algún contenido listado en Rradio infringe sus derechos, puede enviarnos una solicitud de eliminación (takedown notice) a la dirección de correo electrónico indicada más abajo.

**Su solicitud debe incluir:**
- Identificación del contenido supuestamente infractor (nombre de la estación y URL de la página en Rradio).
- Su información de contacto (nombre completo, correo electrónico, dirección postal).
- Una declaración de que cree de buena fe que el uso del material no está autorizado por el propietario de los derechos, su agente o la ley.
- Una declaración, bajo pena de perjurio, de que la información en la notificación es exacta y que usted es el propietario del derecho de autor o está autorizado para actuar en su nombre.
- Su firma física o electrónica.

Procesaremos su solicitud y eliminaremos el enlace a la estación dentro de los **5 días hábiles** siguientes a la recepción de una notificación válida.`,
      },
      {
        id: 'removal',
        heading: '4. Solicitud de Eliminación de Estación',
        body: `Si usted opera una emisora de radio y desea que su estación sea eliminada del directorio de Rradio por cualquier motivo, puede solicitarlo enviando un correo electrónico con el nombre de la estación y la URL de la página en nuestro sitio. Procesaremos su solicitud en un plazo máximo de **5 días hábiles**.`,
      },
      {
        id: 'contact',
        heading: '5. Contacto',
        body: `Para notificaciones DMCA, solicitudes de eliminación o cualquier consulta relacionada con derechos de autor, contacta con nosotros en:\n\n**dmca@rradio.online**`,
      },
    ],
    back: 'Volver al inicio',
  },
  en: {
    title: 'Legal Notice & DMCA Policy',
    updated: 'Last updated: April 2025',
    sections: [
      {
        id: 'disclaimer',
        heading: '1. Third-Party Content Disclaimer',
        body: `Rradio is a directory and aggregator of publicly available radio stations on the internet. **Rradio does not host, store, transmit, or reproduce any audio files on its own servers.**

Our service solely provides links (URLs) to live radio streams that are already publicly available on the internet and are operated and controlled by their respective broadcasters.

When you play a station, the audio is streamed directly from the broadcaster's servers to your device. Rradio acts exclusively as a link intermediary and does not intervene in the transmitted content.`,
      },
      {
        id: 'copyright',
        heading: '2. Copyright',
        body: `Rradio respects the intellectual property and copyright of third parties. The content of each radio station is the sole responsibility of that station and the licenses it has obtained from rights management organizations (such as ASCAP, BMI, SOCAN, or equivalent organizations depending on the country).

Rradio does not control, edit, or moderate the content broadcast by radio stations and assumes no responsibility for such content.`,
      },
      {
        id: 'dmca',
        heading: '3. DMCA Policy (Digital Millennium Copyright Act)',
        body: `If you are a copyright owner or authorized to act on behalf of the owner, and you believe that content listed on Rradio infringes your rights, you may send us a takedown notice at the email address indicated below.

**Your notice must include:**
- Identification of the allegedly infringing content (station name and URL on Rradio).
- Your contact information (full name, email address, postal address).
- A statement that you believe in good faith that the use of the material is not authorized by the copyright owner, its agent, or the law.
- A statement, under penalty of perjury, that the information in the notice is accurate and that you are the copyright owner or authorized to act on their behalf.
- Your physical or electronic signature.

We will process your request and remove the link to the station within **5 business days** of receiving a valid notice.`,
      },
      {
        id: 'removal',
        heading: '4. Station Removal Request',
        body: `If you operate a radio station and would like your station removed from the Rradio directory for any reason, you may request this by sending an email with the station name and its URL on our site. We will process your request within **5 business days**.`,
      },
      {
        id: 'contact',
        heading: '5. Contact',
        body: `For DMCA notices, removal requests, or any copyright-related inquiry, contact us at:\n\n**dmca@rradio.online**`,
      },
    ],
    back: 'Back to home',
  },
}

export default async function DmcaPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams.locale || 'es'
  const t = (content as any)[locale] || content.es

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <article className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 md:p-12">
        <header className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t.title}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t.updated}</p>
        </header>

        <div className="space-y-10">
          {t.sections.map((section: { id: string; heading: string; body: string }) => (
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

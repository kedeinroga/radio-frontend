import type { Metadata } from 'next'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ locale: string }> | { locale: string }
}

// ISR: Revalidate daily
export const revalidate = 86400

const PRIVACY_LAST_UPDATED = '2026-10-14'

/** **negrita** y [texto](https://…) del contenido de i18n (texto propio, no de usuarios). */
function renderInline(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(
      /\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-purple-600 dark:text-purple-400 underline">$1</a>'
    )
}

/**
 * Generate metadata for Privacy Policy page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams.locale || 'es'
  
  return {
    title: locale === 'es' ? 'Política de Privacidad | Rradio' : 'Privacy Policy | Rradio',
    description: locale === 'es' 
      ? 'Política de privacidad de Rradio: cómo recopilamos, usamos y protegemos tu información personal. GDPR/CCPA compliant.'
      : 'Rradio Privacy Policy: how we collect, use, and protect your personal information. GDPR/CCPA compliant.',
    robots: {
      index: true,
      follow: true,
    },
  }
}

/**
 * Privacy Policy Page
 * Multi-language, SEO-optimized, GDPR/CCPA compliant
 */
export default async function PrivacyPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams.locale || 'es'
  
  // Import translations dynamically
  const t = await import(`@/i18n/locales/${locale}.json`).then(m => m.default)
  
  // Fecha real del último cambio de contenido (actualizar al modificar la política)
  const lastUpdated = new Date(PRIVACY_LAST_UPDATED).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <article className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 md:p-12">
        {/* Header */}
        <header className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {t.privacy?.title || 'Política de Privacidad'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {(t.privacy?.lastUpdated || 'Última actualización: {{date}}').replace('{{date}}', lastUpdated)}
          </p>
        </header>

        {/* Introduction */}
        <section className="mb-8">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {t.privacy?.intro || 'En Rradio, valoramos y respetamos tu privacidad.'}
          </p>
        </section>

        {/* Privacy Sections */}
        <div className="space-y-8">
          {Object.entries(t.privacy?.sections || {}).map(([key, section]: [string, any]) => (
            <section key={key} className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {section.title}
              </h2>
              <div 
                className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: renderInline(section.content) }}
              />
            </section>
          ))}
        </div>

        {/* Back Link */}
        <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            href={`/${locale}`}
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium inline-flex items-center gap-2"
          >
            ← {t.common?.back || 'Volver al inicio'}
          </Link>
        </footer>
      </article>
    </main>
  )
}

import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ locale: string }> | { locale: string }
}

// ISR: Revalidate daily
export const revalidate = 86400

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
  
  const currentDate = new Date().toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
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
            {(t.privacy?.lastUpdated || 'Última actualización: {{date}}').replace('{{date}}', currentDate)}
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
                dangerouslySetInnerHTML={{ __html: section.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
              />
            </section>
          ))}
        </div>

        {/* Back Link */}
        <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <a
            href={`/${locale}`}
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium inline-flex items-center gap-2"
          >
            ← {t.common?.back || 'Volver al inicio'}
          </a>
        </footer>
      </article>
    </main>
  )
}

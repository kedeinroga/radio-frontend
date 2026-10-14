import type { Metadata } from 'next'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ locale: string }>
}

// ISR: Revalidate daily
export const revalidate = 86400

/**
 * Generate metadata for Contact page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams.locale || 'es'
  
  return {
    title: locale === 'es' ? 'Contacto | Rradio' : 'Contact | Rradio',
    description: locale === 'es' 
      ? 'Contacta con Rradio: soporte, privacidad, derechos de autor y colaboraciones.'
      : 'Contact Rradio: support, privacy, copyright and partnerships.',
    robots: {
      index: true,
      follow: true,
    },
  }
}

/**
 * Contact Page
 * Multi-language contact information
 */
export default async function ContactPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params)
  const locale = resolvedParams.locale || 'es'
  
  // Import translations dynamically
  const t = await import(`@/i18n/locales/${locale}.json`).then(m => m.default)

  const contactSections = [
    {
      icon: '💬',
      ...t.contact?.sections?.general
    },
    {
      icon: '🔒',
      ...t.contact?.sections?.privacy
    },
    {
      icon: '⚖️',
      ...t.contact?.sections?.legal
    },
    {
      icon: '🤝',
      ...t.contact?.sections?.business
    }
  ]

  return (
    <main className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t.contact?.title || 'Contacto'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            {t.contact?.subtitle || 'Estamos aquí para ayudarte'}
          </p>
        </header>

        {/* Contact Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {contactSections.map((section, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{section.icon}</div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                {section.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                {section.description}
              </p>
              <a 
                href={`mailto:${section.email}`}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium inline-flex items-center gap-2"
              >
                {section.email}
                <span>→</span>
              </a>
            </div>
          ))}
        </div>

        {/* Response Time */}
        <section className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-12">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
            ⏱️ {t.contact?.response?.title || 'Tiempo de Respuesta'}
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            {t.contact?.response?.content}
          </p>
        </section>

        {/* Back Link */}
        <footer className="text-center">
          <Link
            href={`/${locale}`}
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium inline-flex items-center gap-2"
          >
            ← {t.common?.back || 'Volver al inicio'}
          </Link>
        </footer>
      </div>
    </main>
  )
}

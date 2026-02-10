'use client'

import { useEffect } from 'react'
import { useCookieConsent } from '@/hooks/useCookieConsent'

/**
 * GDPR/CCPA Cookie Consent Banner
 * 
 * Displays a bottom banner asking for cookie consent on first visit.
 * Saves user preferences to localStorage.
 */
export function CookieConsent() {
  const { showBanner, acceptAll, rejectAll } = useCookieConsent()

  // Get locale from window location  
  const locale = typeof window !== 'undefined' 
    ? window.location.pathname.split('/')[1] || 'es'
    : 'es'

  // Don't render on server
  if (typeof window === 'undefined') return null
  
  // Don't render if consent already given
  if (!showBanner) return null

  // Simple translations
  const translations: Record<string, any> = {
    es: {
      title: '🍪 Usamos Cookies',
      description: 'Usamos cookies esenciales para el funcionamiento del sitio y cookies de terceros (Google AdSense, Google Analytics) para publicidad personalizada y análisis. Al continuar, aceptas nuestro uso de cookies.',
      acceptAll: 'Aceptar Todo',
      rejectAll: 'Rechazar No Esenciales',
      learnMore: 'Más Información'
    },
    en: {
      title: '🍪 We Use Cookies',
      description: 'We use essential cookies for site functionality and third-party cookies (Google AdSense, Google Analytics) for personalized advertising and analytics. By continuing, you accept our use of cookies.',
      acceptAll: 'Accept All',
      rejectAll: 'Reject Non-Essential',
      learnMore: 'Learn More'
    },
    fr: {
      title: '🍪 Nous Utilisons des Cookies',
      description: 'Nous utilisons des cookies essentiels pour le fonctionnement du site et des cookies tiers (Google AdSense, Google Analytics) pour la publicité personnalisée et l\'analyse.',
      acceptAll: 'Tout Accepter',
      rejectAll: 'Rejeter Non Essentiels',
      learnMore: 'En Savoir Plus'
    },
    de: {
      title: '🍪 Wir Verwenden Cookies',
      description: 'Wir verwenden wesentliche Cookies für die Website-Funktionalität und Cookies von Drittanbietern (Google AdSense, Google Analytics) für personalisierte Werbung und Analysen.',
      acceptAll: 'Alle Akzeptieren',
      rejectAll: 'Nicht-Essentiell Ablehnen',
      learnMore: 'Mehr Erfahren'
    }
  }

  const t = translations[locale] || translations.es

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Content */}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
              {t.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {t.description}
              {' '}
              <a 
                href={`/${locale}/privacy`}
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 underline"
              >
                {t.learnMore}
              </a>
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={rejectAll}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors whitespace-nowrap"
            >
              {t.rejectAll}
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors whitespace-nowrap"
            >
              {t.acceptAll}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

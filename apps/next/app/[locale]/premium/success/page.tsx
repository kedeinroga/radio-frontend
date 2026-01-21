/**
 * Premium Success Page
 * 
 * Shown after successful subscription payment.
 */

import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Sparkles } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const translations = (await import(`@/i18n/locales/${locale}.json`)).default
  
  return {
    title: `${translations.premium.success.title} - Radio App`,
    description: translations.premium.success.subtitle,
  }
}

export default async function PremiumSuccessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = (await import(`@/i18n/locales/${locale}.json`)).default
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Success icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            <CheckCircle className="relative text-green-500" size={80} />
          </div>
        </div>

        {/* Success message */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <Sparkles className="text-primary-600" />
            {t.premium.success.title}
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            {t.premium.success.subtitle}
          </p>
        </div>

        {/* Benefits recap */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 space-y-4 text-left border border-neutral-200 dark:border-neutral-700">
          <h2 className="font-semibold text-lg">{t.premium.success.nowYouCan}</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={16} />
              <span>{t.premium.benefits.noAds.title}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={16} />
              <span>{t.premium.benefits.superiorQuality.title}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={16} />
              <span>{t.premium.benefits.exclusiveStations.title}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={16} />
              <span>{t.premium.benefits.backgroundPlay.title}</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={16} />
              <span>{t.premium.benefits.prioritySupport.title}</span>
            </li>
          </ul>
        </div>

        {/* CTA buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            {t.premium.success.startListening}
          </Link>
          <Link
            href="/account/subscription"
            className="block w-full bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 py-3 rounded-lg font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
          >
            {t.premium.success.viewSubscription}
          </Link>
        </div>

        {/* Info note */}
        <p className="text-xs text-neutral-500 dark:text-neutral-500">
          {t.premium.success.confirmationNote}
        </p>
      </div>
    </main>
  )
}

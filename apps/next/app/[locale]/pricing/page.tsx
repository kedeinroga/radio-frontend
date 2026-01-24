/**
 * Pricing Page
 * 
 * Displays subscription plans with pricing and features.
 * Allows users to subscribe to Premium.
 */

'use client'

import { Metadata } from 'next'
import { PricingPlans } from '@/components/premium/PricingPlans'
import { PremiumFeatures } from '@/components/premium/PremiumFeatures'
import { FAQ } from '@/components/premium/FAQ'
import { useParams } from 'next/navigation'
import { useAppTranslation } from '@/hooks/useAppTranslation'

export default function PricingPage() {
  const params = useParams()
  const locale = params.locale as string
  const { t } = useAppTranslation()
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            {t('premium.upgradeTitle')}
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            {t('premium.upgradeSubtitle')}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{t('premium.freeTrial')}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{t('premium.cancelAnytime')}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{t('premium.noCommitment')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <PricingPlans />
        </div>
      </section>

      {/* Premium Features */}
      <section className="py-20 bg-white dark:bg-neutral-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('premium.benefits.title')}
          </h2>
          <PremiumFeatures />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t('premium.faq.title')}
          </h2>
          <FAQ />
        </div>
      </section>
    </main>
  )
}

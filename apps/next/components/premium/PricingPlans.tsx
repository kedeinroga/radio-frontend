/**
 * Pricing Plans Component
 * 
 * Displays subscription plan cards with pricing and features.
 */

'use client'

import { useState } from 'react'
import { Check, Crown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAppTranslation } from '@/hooks/useAppTranslation'

type BillingPeriod = 'monthly' | 'yearly'

interface PlanFeature {
  text: string
  included: boolean
}

interface Plan {
  id: string
  name: string
  price: {
    monthly: number
    yearly: number
  }
  description: string
  features: PlanFeature[]
  popular?: boolean
  stripePriceId: {
    monthly: string
    yearly: string
  }
}

export function PricingPlans() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly')
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()
  const { t } = useAppTranslation()

  const PLANS: Plan[] = [
    {
      id: 'free',
      name: t('premium.plans.free'),
      price: {
        monthly: 0,
        yearly: 0,
      },
      description: t('premium.plans.freeDescription'),
      features: [
        { text: t('premium.plans.freeFeatures.thousands'), included: true },
        { text: t('premium.plans.freeFeatures.search'), included: true },
        { text: t('premium.plans.freeFeatures.favorites'), included: true },
        { text: t('premium.plans.freeFeatures.withAds'), included: false },
        { text: t('premium.plans.freeFeatures.standardQuality'), included: false },
        { text: t('premium.plans.freeFeatures.exclusiveStations'), included: false },
      ],
      stripePriceId: {
        monthly: '',
        yearly: '',
      },
    },
    {
      id: 'premium',
      name: t('premium.plans.premium'),
      price: {
        monthly: 4.99,
        yearly: 49.99,
      },
      description: t('premium.plans.premiumDescription'),
      popular: true,
      features: [
        { text: t('premium.plans.premiumFeatures.everything'), included: true },
        { text: t('premium.plans.premiumFeatures.noAds'), included: true },
        { text: t('premium.plans.premiumFeatures.superiorQuality'), included: true },
        { text: t('premium.plans.premiumFeatures.exclusiveStations'), included: true },
        { text: t('premium.plans.premiumFeatures.backgroundPlay'), included: true },
        { text: t('premium.plans.premiumFeatures.prioritySupport'), included: true },
      ],
      stripePriceId: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || 'price_monthly',
        yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY || 'price_yearly',
      },
    },
  ]

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      router.push('/signup')
      return
    }

    try {
      setIsLoading(planId)

      const plan = PLANS.find((p) => p.id === planId)
      if (!plan) return

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId[billingPeriod],
          billingPeriod,
        }),
      })

      const data = await response.json()

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {

      alert(t('common.error'))
    } finally {
      setIsLoading(null)
    }
  }

  const yearlyDiscount = Math.round(
    ((PLANS[1].price.monthly * 12 - PLANS[1].price.yearly) /
      (PLANS[1].price.monthly * 12)) *
      100
  )

  return (
    <div className="space-y-8">
      {/* Billing period toggle */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setBillingPeriod('monthly')}
          className={`
            px-6 py-2 rounded-lg font-semibold transition-all
            ${
              billingPeriod === 'monthly'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
            }
          `}
        >
          {t('premium.plans.monthly')}
        </button>
        <button
          onClick={() => setBillingPeriod('yearly')}
          className={`
            relative px-6 py-2 rounded-lg font-semibold transition-all
            ${
              billingPeriod === 'yearly'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
            }
          `}
        >
          {t('premium.plans.yearly')}
          <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
            -{yearlyDiscount}%
          </span>
        </button>
      </div>

      {/* Plan cards */}
      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`
              relative rounded-lg border-2 p-6 space-y-6
              ${
                plan.popular
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
                  : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800'
              }
            `}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-600 text-white text-sm font-semibold rounded-full">
                {t('premium.plans.mostPopular')}
              </div>
            )}

            {/* Plan header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {plan.id === 'premium' && <Crown className="text-primary-600" size={24} />}
                <h3 className="text-2xl font-bold">{plan.name}</h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400">{plan.description}</p>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">
                  ${plan.price[billingPeriod].toFixed(2)}
                </span>
                <span className="text-neutral-600 dark:text-neutral-400">
                  /{billingPeriod === 'monthly' ? t('premium.plans.perMonth') : t('premium.plans.perYear')}
                </span>
              </div>
              {billingPeriod === 'yearly' && plan.price.yearly > 0 && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  ${(plan.price.yearly / 12).toFixed(2)}/{t('premium.plans.perMonth')} ({t('premium.plans.billedAnnually')})
                </p>
              )}
            </div>

            {/* Features */}
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check
                    className={
                      feature.included
                        ? 'text-green-500 shrink-0'
                        : 'text-neutral-300 dark:text-neutral-600 shrink-0'
                    }
                    size={20}
                  />
                  <span
                    className={
                      feature.included
                        ? 'text-neutral-900 dark:text-neutral-100'
                        : 'text-neutral-500 dark:text-neutral-500 line-through'
                    }
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA button */}
            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={isLoading === plan.id}
              className={`
                w-full py-3 rounded-lg font-semibold transition-all
                ${
                  plan.popular
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-600'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isLoading === plan.id
                ? t('premium.plans.cta.processing')
                : plan.id === 'free'
                ? t('premium.plans.cta.startFree')
                : t('premium.plans.cta.tryFree')}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

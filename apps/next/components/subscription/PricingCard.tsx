'use client'

/**
 * PricingCard Component
 * 
 * Tarjeta de precio para mostrar planes de suscripción.
 * Muestra características, precio, y CTA para suscribirse.
 * 
 * @example
 * ```tsx
 * <PricingCard
 *   plan={premiumPlan}
 *   isPopular={true}
 *   onSubscribe={() => handleSubscribe('premium-monthly')}
 * />
 * ```
 */

import { useState } from 'react'
import type { SubscriptionPlan } from '@radio-app/app'
import { formatPlanPrice, calculateYearlySavings } from '@radio-app/app'

export interface PricingCardProps {
  plan: SubscriptionPlan
  isPopular?: boolean
  currentPlanId?: string
  onSubscribe: (planId: string, interval: 'month' | 'year') => void
  className?: string
}

export function PricingCard({
  plan,
  isPopular = false,
  currentPlanId,
  onSubscribe,
  className = '',
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedInterval, setSelectedInterval] = useState<'month' | 'year'>('month')

  const isCurrentPlan = currentPlanId === plan.id
  const isFree = plan.type === 'free'

  /**
   * Handle subscribe button click
   */
  const handleSubscribe = async () => {
    if (isFree || isCurrentPlan) return

    setIsLoading(true)
    try {
      await onSubscribe(plan.id, selectedInterval)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Get price to display
   */
  const getPrice = () => {
    const price = selectedInterval === 'month' ? plan.priceMonthly : plan.priceYearly
    return formatPlanPrice(price, plan.currency)
  }

  /**
   * Get savings text for yearly plan
   */
  const getSavingsText = () => {
    if (selectedInterval !== 'year' || plan.priceYearly === 0) return null

    const savings = calculateYearlySavings(plan.priceMonthly, plan.priceYearly)
    const savingsFormatted = formatPlanPrice(savings, plan.currency)

    return `Save ${savingsFormatted}/year`
  }

  /**
   * Get button text
   */
  const getButtonText = () => {
    if (isFree) return 'Current Plan'
    if (isCurrentPlan) return 'Current Plan'
    if (isLoading) return 'Loading...'
    return 'Subscribe Now'
  }

  return (
    <div
      className={`
        relative flex flex-col rounded-2xl border-2 p-8
        transition-all duration-200 hover:shadow-xl
        ${isPopular ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-200'}
        ${className}
      `}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-semibold px-4 py-1 rounded-full shadow-md">
            Most Popular
          </span>
        </div>
      )}

      {/* Plan Name */}
      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>

      {/* Short Description */}
      {plan.shortDescription && (
        <p className="text-gray-600 text-sm mb-4">{plan.shortDescription}</p>
      )}

      {/* Billing Interval Toggle (if not free) */}
      {!isFree && plan.priceYearly > 0 && (
        <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setSelectedInterval('month')}
            className={`
              flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
              ${selectedInterval === 'month' 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'}
            `}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedInterval('year')}
            className={`
              flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
              ${selectedInterval === 'year' 
                ? 'bg-white shadow-sm text-gray-900' 
                : 'text-gray-600 hover:text-gray-900'}
            `}
          >
            Yearly
          </button>
        </div>
      )}

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold">{getPrice()}</span>
          {!isFree && (
            <span className="text-gray-600">
              /{selectedInterval === 'month' ? 'mo' : 'yr'}
            </span>
          )}
        </div>
        {getSavingsText() && (
          <p className="text-green-600 text-sm font-semibold mt-1">
            {getSavingsText()}
          </p>
        )}
      </div>

      {/* Subscribe Button */}
      <button
        onClick={handleSubscribe}
        disabled={isFree || isCurrentPlan || isLoading}
        className={`
          w-full py-3 px-6 rounded-lg font-semibold text-white
          transition-all duration-200
          ${isPopular 
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600' 
            : 'bg-gray-900 hover:bg-gray-800'}
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isLoading ? 'cursor-wait' : ''}
        `}
      >
        {getButtonText()}
      </button>

      {/* Features List */}
      <div className="mt-8 space-y-4">
        <p className="text-sm font-semibold text-gray-900 mb-3">What's included:</p>

        {/* Ads */}
        <Feature
          included={!plan.features.showAds}
          text={plan.features.showAds ? 'Ad-supported' : 'Ad-free listening'}
        />

        {/* Audio Quality */}
        <Feature
          included={plan.features.maxBitrate >= 256}
          text={`Up to ${plan.features.maxBitrate}kbps quality`}
        />

        {/* Favorites */}
        <Feature
          included={plan.features.maxFavorites === 0 || plan.features.maxFavorites > 20}
          text={
            plan.features.maxFavorites === 0
              ? 'Unlimited favorites'
              : `${plan.features.maxFavorites} favorite stations`
          }
        />

        {/* Playlists */}
        <Feature
          included={plan.features.canCreatePlaylists}
          text="Custom playlists"
        />

        {/* History */}
        <Feature
          included={plan.features.hasListeningHistory}
          text="Listening history"
        />

        {/* Recommendations */}
        <Feature
          included={plan.features.hasRecommendations}
          text="Personalized recommendations"
        />

        {/* Offline */}
        <Feature
          included={plan.features.canDownloadOffline}
          text="Offline downloads"
        />

        {/* Devices */}
        <Feature
          included={plan.features.maxDevices > 1}
          text={`${plan.features.maxDevices} simultaneous device${plan.features.maxDevices > 1 ? 's' : ''}`}
        />

        {/* Support */}
        <Feature
          included={plan.features.hasPrioritySupport}
          text={plan.features.hasPrioritySupport ? 'Priority support' : 'Standard support'}
        />
      </div>
    </div>
  )
}

/**
 * Feature item component
 */
function Feature({ included, text }: { included: boolean; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 mt-0.5">
        {included ? (
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
      </div>
      <span className={`text-sm ${included ? 'text-gray-700' : 'text-gray-500'}`}>
        {text}
      </span>
    </div>
  )
}

export default PricingCard

'use client'

/**
 * Subscription Management Page Example
 * 
 * Página de ejemplo que muestra el dashboard de suscripción
 * y permite gestionar la suscripción.
 */

import { useState } from 'react'
import { SubscriptionStatus } from './SubscriptionStatus'
import { PremiumBadge } from './PremiumBadge'
import { usePremiumStatus } from '../../hooks/usePremiumStatus'

export default function SubscriptionManagementExample() {
  const { subscription, plan, isLoading, isPremium, refresh } = usePremiumStatus()
  const [, setActionLoading] = useState(false)

  /**
   * Handle cancel subscription
   */
  const handleCancel = async () => {
    if (!subscription) return

    const confirmed = window.confirm(
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.'
    )

    if (!confirmed) return

    setActionLoading(true)

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          cancelImmediately: false, // Cancel at end of period
          reason: 'user_requested',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }

      const data = await response.json()
      alert(data.message)
      
      // Refresh status
      refresh()

    } catch (error) {
      console.error('Cancel error:', error)
      alert('Failed to cancel subscription. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  /**
   * Handle resume subscription
   */
  const handleResume = async () => {
    if (!subscription) return

    setActionLoading(true)

    try {
      const response = await fetch('/api/subscription/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: subscription.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to resume subscription')
      }

      const data = await response.json()
      alert(data.message)
      
      // Refresh status
      refresh()

    } catch (error) {
      console.error('Resume error:', error)
      alert('Failed to resume subscription. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  /**
   * Handle manage billing (Stripe Customer Portal)
   */
  const handleManageBilling = async () => {
    // TODO: Create Stripe Customer Portal session
    alert('Redirecting to billing portal...')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isPremium || !subscription) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center">
            <div className="text-6xl mb-4">🎵</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Active Subscription
            </h2>
            <p className="text-gray-600 mb-6">
              Upgrade to Premium to enjoy ad-free listening and exclusive features.
            </p>
            <a
              href="/pricing"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View Plans
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Subscription Management
            </h1>
            <PremiumBadge />
          </div>
          <p className="text-gray-600">
            Manage your subscription, billing, and preferences
          </p>
        </div>

        {/* Subscription Status Card */}
        <SubscriptionStatus
          subscription={subscription}
          plan={plan}
          onCancel={handleCancel}
          onResume={handleResume}
          onManageBilling={handleManageBilling}
          className="mb-8"
        />

        {/* Premium Features Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Your Premium Benefits
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <BenefitItem
              icon="🎵"
              title="Ad-free listening"
              description="Enjoy uninterrupted music"
            />
            <BenefitItem
              icon="🎧"
              title="High quality audio"
              description="Up to 320kbps streaming"
            />
            <BenefitItem
              icon="❤️"
              title="Unlimited favorites"
              description="Save all your stations"
            />
            <BenefitItem
              icon="📱"
              title="Multi-device"
              description="Listen on 3 devices"
            />
            <BenefitItem
              icon="📊"
              title="Listening history"
              description="Track what you've heard"
            />
            <BenefitItem
              icon="🎯"
              title="Recommendations"
              description="Personalized for you"
            />
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Need Help?
          </h3>
          <p className="text-blue-800 mb-4">
            Our support team is here to help with any questions about your subscription.
          </p>
          <a
            href="/support"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}

/**
 * Benefit Item Component
 */
function BenefitItem({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
      <span className="text-2xl">{icon}</span>
      <div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  )
}

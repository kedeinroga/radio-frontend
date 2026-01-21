'use client'

/**
 * SubscriptionStatus Component
 * 
 * Dashboard para mostrar el estado de la suscripción del usuario.
 * Incluye información del plan, fecha de renovación, y opciones de gestión.
 * 
 * @example
 * ```tsx
 * <SubscriptionStatus
 *   subscription={subscription}
 *   plan={plan}
 *   onCancel={handleCancel}
 *   onResume={handleResume}
 * />
 * ```
 */

import { useState } from 'react'
import type { Subscription, SubscriptionPlan } from '@radio-app/app'
import { 
  formatSubscriptionPrice, 
  getBillingIntervalText,
  getDaysRemainingInPeriod,
  isSubscriptionCanceled,
} from '@radio-app/app'

export interface SubscriptionStatusProps {
  subscription: Subscription
  plan: SubscriptionPlan | null
  onCancel?: () => void
  onResume?: () => void
  onManageBilling?: () => void
  className?: string
}

export function SubscriptionStatus({
  subscription,
  plan,
  onCancel,
  onResume,
  onManageBilling,
  className = '',
}: SubscriptionStatusProps) {
  const [isLoading, setIsLoading] = useState(false)

  const isCanceled = isSubscriptionCanceled(subscription)
  const daysRemaining = getDaysRemainingInPeriod(subscription)
  const priceText = formatSubscriptionPrice(subscription)
  const intervalText = getBillingIntervalText(subscription.billingInterval)

  /**
   * Get status badge
   */
  const getStatusBadge = () => {
    const badges: Record<typeof subscription.status, { color: string; text: string }> = {
      active: { color: 'bg-green-100 text-green-800', text: 'Active' },
      trialing: { color: 'bg-blue-100 text-blue-800', text: 'Trial' },
      past_due: { color: 'bg-yellow-100 text-yellow-800', text: 'Past Due' },
      canceled: { color: 'bg-red-100 text-red-800', text: 'Canceled' },
      unpaid: { color: 'bg-red-100 text-red-800', text: 'Unpaid' },
      incomplete: { color: 'bg-gray-100 text-gray-800', text: 'Incomplete' },
      incomplete_expired: { color: 'bg-gray-100 text-gray-800', text: 'Expired' },
      paused: { color: 'bg-gray-100 text-gray-800', text: 'Paused' },
    }

    const badge = badges[subscription.status]

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${badge.color}`}>
        {badge.text}
      </span>
    )
  }

  /**
   * Handle cancel
   */
  const handleCancel = async () => {
    if (!onCancel) return

    setIsLoading(true)
    try {
      await onCancel()
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle resume
   */
  const handleResume = async () => {
    if (!onResume) return

    setIsLoading(true)
    try {
      await onResume()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {plan?.name || 'Subscription'}
            </h2>
            {getStatusBadge()}
          </div>
          
          {/* Premium Badge */}
          {subscription.status === 'active' && (
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-2 rounded-lg font-semibold shadow-md">
              ⭐ Premium
            </div>
          )}
        </div>

        {plan?.description && (
          <p className="text-gray-600 mt-3">{plan.description}</p>
        )}
      </div>

      {/* Details */}
      <div className="p-6 space-y-6">
        {/* Pricing Info */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Price</p>
            <p className="text-lg font-semibold text-gray-900">
              {priceText} {intervalText}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">
              {isCanceled ? 'Expires on' : 'Next billing date'}
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {subscription.currentPeriodEnd.toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Days Remaining */}
        {daysRemaining > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">{daysRemaining} days</span> remaining in current period
            </p>
          </div>
        )}

        {/* Cancellation Warning */}
        {isCanceled && subscription.cancelAt && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-yellow-800">Subscription Canceled</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Your subscription will end on {subscription.cancelAt.toLocaleDateString()}. 
                  You'll lose access to premium features after this date.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trial Info */}
        {subscription.status === 'trialing' && subscription.trialEnd && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">
              <span className="font-semibold">Trial Period:</span> Ends on {subscription.trialEnd.toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {/* Manage Billing Button */}
          {onManageBilling && subscription.status === 'active' && (
            <button
              onClick={onManageBilling}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Manage Billing
            </button>
          )}

          {/* Resume Button */}
          {isCanceled && onResume && (
            <button
              onClick={handleResume}
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Loading...' : 'Resume Subscription'}
            </button>
          )}

          {/* Cancel Button */}
          {!isCanceled && onCancel && subscription.status === 'active' && (
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 py-2 px-4 border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Loading...' : 'Cancel Subscription'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SubscriptionStatus

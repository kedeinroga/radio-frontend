/**
 * Subscription Manager Component
 * 
 * Allows users to view and manage their Premium subscription.
 * - View current plan details
 * - Cancel subscription
 * - Update payment method
 * - View billing history
 */

'use client'

import { useState, useEffect } from 'react'
import { Crown, Calendar, CreditCard, AlertCircle } from 'lucide-react'
import { useAppTranslation } from '@/hooks/useAppTranslation'

interface SubscriptionData {
  id: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  plan: {
    name: string
    amount: number
    interval: 'month' | 'year'
  }
  trialEnd?: string
}

export function SubscriptionManager() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCanceling, setIsCanceling] = useState(false)
  const { t } = useAppTranslation()

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/stripe/subscription')
      const data = await response.json()
      setSubscription(data.subscription)
    } catch (error) {

    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm(t('premium.subscription.cancelConfirm'))) {
      return
    }

    try {
      setIsCanceling(true)
      const response = await fetch('/api/stripe/subscription/cancel', {
        method: 'POST',
      })

      if (response.ok) {
        await fetchSubscription()
        alert(t('premium.subscription.cancelSuccess'))
      } else {
        throw new Error('Failed to cancel subscription')
      }
    } catch (error) {

      alert(t('common.error'))
    } finally {
      setIsCanceling(false)
    }
  }

  const handleReactivateSubscription = async () => {
    try {
      const response = await fetch('/api/stripe/subscription/reactivate', {
        method: 'POST',
      })

      if (response.ok) {
        await fetchSubscription()
        alert(t('premium.subscription.reactivateSuccess'))
      } else {
        throw new Error('Failed to reactivate subscription')
      }
    } catch (error) {

      alert(t('common.error'))
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-40 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        <div className="h-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-8 text-center space-y-4">
        <AlertCircle className="mx-auto text-neutral-400" size={48} />
        <div>
          <h2 className="text-xl font-semibold mb-2">{t('premium.subscription.noSubscription')}</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            {t('premium.subscription.noSubscriptionMessage')}
          </p>
          <a
            href="/pricing"
            className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            {t('premium.subscription.viewPlans')}
          </a>
        </div>
      </div>
    )
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    trialing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    canceled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    past_due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  }

  const statusLabels = {
    active: t('premium.subscription.status.active'),
    trialing: t('premium.subscription.status.trialing'),
    canceled: t('premium.subscription.status.canceled'),
    past_due: t('premium.subscription.status.pastDue'),
  }

  return (
    <div className="space-y-6">
      {/* Subscription overview */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Crown size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{subscription.plan.name}</h2>
              <p className="text-white/80">
                ${subscription.plan.amount.toFixed(2)}/{subscription.plan.interval === 'month' ? t('premium.plans.perMonth') : t('premium.plans.perYear')}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[subscription.status]}`}>
            {statusLabels[subscription.status]}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-white/20">
          <div className="flex items-start gap-3">
            <Calendar className="text-white/80 mt-0.5" size={20} />
            <div>
              <p className="text-sm text-white/80">
                {subscription.status === 'trialing' ? t('premium.subscription.trialEnd') : subscription.cancelAtPeriodEnd ? t('premium.subscription.accessUntil') : t('premium.subscription.nextRenewal')}
              </p>
              <p className="font-semibold">
                {new Date(subscription.currentPeriodEnd).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation warning */}
      {subscription.cancelAtPeriodEnd && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="font-semibold text-yellow-800 dark:text-yellow-300">
              {t('premium.subscription.canceledWarning')}
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              {t('premium.subscription.canceledMessage', {
                date: new Date(subscription.currentPeriodEnd).toLocaleDateString('es-ES')
              })}
            </p>
            <button
              onClick={handleReactivateSubscription}
              className="mt-3 text-sm font-semibold text-yellow-700 dark:text-yellow-300 hover:text-yellow-900 dark:hover:text-yellow-100 underline"
            >
              {t('premium.subscription.reactivate')}
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 divide-y divide-neutral-200 dark:divide-neutral-700">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard size={20} className="text-neutral-400" />
              <div>
                <p className="font-semibold">{t('premium.subscription.paymentMethod')}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {t('premium.subscription.updatePaymentMethod')}
                </p>
              </div>
            </div>
            <a
              href="/api/stripe/portal"
              className="text-primary-600 hover:text-primary-700 font-semibold text-sm"
            >
              {t('premium.subscription.update')}
            </a>
          </div>
        </div>

        {!subscription.cancelAtPeriodEnd && (
          <div className="p-4">
            <button
              onClick={handleCancelSubscription}
              disabled={isCanceling}
              className="text-red-600 hover:text-red-700 font-semibold text-sm disabled:opacity-50"
            >
              {isCanceling ? t('premium.subscription.canceling') : t('premium.subscription.cancelSubscription')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

/**
 * Pricing Page Example
 * 
 * Página de ejemplo que muestra los planes de precios
 * y permite suscribirse.
 */

import { useState } from 'react'
import { DEFAULT_PLANS } from '@radio-app/app'
import { PricingCard } from './PricingCard'
import { usePremiumStatus } from '../../hooks/usePremiumStatus'

export default function PricingPageExample() {
  const { plan: currentPlan, isLoading } = usePremiumStatus()
  const [subscribing, setSubscribing] = useState(false)

  /**
   * Handle subscribe
   */
  const handleSubscribe = async (planId: string, interval: 'month' | 'year') => {
    setSubscribing(true)

    try {
      // 1. Create checkout session
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingInterval: interval,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const data = await response.json()

      // 2. Redirect to Stripe Checkout
      window.location.href = data.checkoutUrl

    } catch (error) {
      console.error('Subscription error:', error)
      alert('Failed to start subscription. Please try again.')
      setSubscribing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start with a 14-day free trial. Cancel anytime, no questions asked.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {DEFAULT_PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isPopular={plan.isPopular}
              currentPlanId={currentPlan?.id}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes! You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period."
            />
            
            <FAQItem
              question="What payment methods do you accept?"
              answer="We accept all major credit and debit cards through Stripe, including Visa, Mastercard, American Express, and more."
            />
            
            <FAQItem
              question="Is there a free trial?"
              answer="Yes! All new premium subscriptions come with a 14-day free trial. You won't be charged until the trial ends."
            />
            
            <FAQItem
              question="Can I switch plans?"
              answer="Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle."
            />
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Trusted by over 100,000 radio listeners worldwide
          </p>
          <div className="flex items-center justify-center gap-8">
            <div className="text-gray-500">
              <svg className="w-6 h-6 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Secure payments
            </div>
            <div className="text-gray-500">
              <svg className="w-6 h-6 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No hidden fees
            </div>
            <div className="text-gray-500">
              <svg className="w-6 h-6 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              24/7 support
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {subscribing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-lg font-semibold mb-2">Redirecting to checkout...</p>
              <p className="text-sm text-gray-600">Please wait</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * FAQ Item Component
 */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  )
}

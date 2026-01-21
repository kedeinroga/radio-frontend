/**
 * Manage Subscription Page
 * 
 * Allows users to view and manage their Premium subscription.
 */

import { Metadata } from 'next'
import { SubscriptionManager } from '@/components/premium/SubscriptionManager'

export const metadata: Metadata = {
  title: 'Mi Suscripción - Radio App',
  description: 'Gestiona tu suscripción Premium',
}

export default function ManageSubscriptionPage() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Mi Suscripción</h1>
        <SubscriptionManager />
      </div>
    </main>
  )
}

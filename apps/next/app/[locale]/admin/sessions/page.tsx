import { Metadata } from 'next'
import { ActiveSessionsManager } from '@/components/ActiveSessionsManager'

export const metadata: Metadata = {
  title: 'Active Sessions - Admin',
  description: 'Manage your active sessions',
}

export default function SessionsPage() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">Active Sessions</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
          View and manage all active sessions on your account
        </p>
        
        <ActiveSessionsManager />
      </div>
    </div>
  )
}

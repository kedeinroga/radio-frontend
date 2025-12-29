import { Metadata } from 'next'
import { ActiveSessionsManager } from '@/components/ActiveSessionsManager'

export const metadata: Metadata = {
  title: 'Active Sessions - Admin',
  description: 'Manage your active sessions',
}

export default function SessionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Active Sessions</h1>
        <p className="text-gray-600 mb-8">
          View and manage all active sessions on your account
        </p>
        
        <ActiveSessionsManager />
      </div>
    </div>
  )
}

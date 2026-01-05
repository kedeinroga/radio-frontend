import { Metadata } from 'next'
import { SecurityMetrics } from '@/components/SecurityMetrics'
import { SecurityLogs } from '@/components/SecurityLogs'

export const metadata: Metadata = {
  title: 'Security Dashboard - Admin',
  description: 'Monitor security events and metrics',
}

export default function SecurityPage() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Security Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Monitor authentication events, track security metrics, and review activity logs
          </p>
        </div>
        
        <SecurityMetrics />
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 sm:pt-8">
          <SecurityLogs />
        </div>
      </div>
    </div>
  )
}

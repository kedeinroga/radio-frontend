import { Metadata } from 'next'
import { SecurityMetrics } from '@/components/SecurityMetrics'
import { SecurityLogs } from '@/components/SecurityLogs'

export const metadata: Metadata = {
  title: 'Security Dashboard - Admin',
  description: 'Monitor security events and metrics',
}

export default function SecurityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Security Dashboard</h1>
          <p className="text-gray-600">
            Monitor authentication events, track security metrics, and review activity logs
          </p>
        </div>
        
        <SecurityMetrics />
        
        <div className="border-t border-gray-200 pt-8">
          <SecurityLogs />
        </div>
      </div>
    </div>
  )
}

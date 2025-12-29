'use client'

import { useState, useEffect } from 'react'
import { Search, AlertCircle, CheckCircle, XCircle, Info, Loader2 } from 'lucide-react'

interface SecurityLog {
  id: string
  event_type: 'login_success' | 'login_failed' | 'logout' | 'session_revoked' | 'token_refresh' | 'password_change'
  timestamp: string
  user_id: string
  username: string
  ip_address: string
  location?: {
    city?: string
    country?: string
  }
  user_agent?: string
  details?: string
}

interface SecurityLogsResponse {
  logs: SecurityLog[]
  total: number
  page: number
  limit: number
}

const EVENT_TYPE_CONFIG = {
  login_success: { label: 'Login Success', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  login_failed: { label: 'Login Failed', icon: XCircle, color: 'text-red-600 bg-red-50' },
  logout: { label: 'Logout', icon: Info, color: 'text-blue-600 bg-blue-50' },
  session_revoked: { label: 'Session Revoked', icon: AlertCircle, color: 'text-orange-600 bg-orange-50' },
  token_refresh: { label: 'Token Refresh', icon: CheckCircle, color: 'text-gray-600 bg-gray-50' },
  password_change: { label: 'Password Change', icon: AlertCircle, color: 'text-purple-600 bg-purple-50' },
}

export function SecurityLogs() {
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [eventType, setEventType] = useState<string>('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')

  const limit = 50

  const loadLogs = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(eventType && { event_type: eventType }),
        ...(search && { search }),
      })
      
      const response = await fetch(`/api/admin/security/logs?${params}`, {
        credentials: 'include',
        signal: AbortSignal.timeout(10000),
      })
      
      if (!response.ok) {
        throw new Error('Failed to load security logs')
      }
      
      const data: SecurityLogsResponse = await response.json()
      setLogs(data.logs || [])
      setTotal(data.total || 0)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [page, eventType, search])

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleEventTypeChange = (type: string) => {
    setEventType(type)
    setPage(1)
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  const totalPages = Math.ceil(total / limit)

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <p className="font-semibold">Error loading logs</p>
        <p>{error}</p>
        <button
          onClick={loadLogs}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Security Activity Log</h2>
        <p className="text-sm text-gray-600">{total} total events</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by username, IP, or details..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={eventType}
          onChange={(e) => handleEventTypeChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">All Events</option>
          <option value="login_success">Login Success</option>
          <option value="login_failed">Login Failed</option>
          <option value="logout">Logout</option>
          <option value="session_revoked">Session Revoked</option>
          <option value="token_refresh">Token Refresh</option>
          <option value="password_change">Password Change</option>
        </select>
        
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No security events found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => {
                  const config = EVENT_TYPE_CONFIG[log.event_type]
                  const Icon = config.icon
                  
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${config.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {config.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{log.username}</div>
                        <div className="text-xs text-gray-500">{log.user_id.substring(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {log.location?.city && log.location?.country
                            ? `${log.location.city}, ${log.location.country}`
                            : log.ip_address}
                        </div>
                        {log.location?.city && (
                          <div className="text-xs text-gray-500">{log.ip_address}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs truncate" title={log.details || log.user_agent}>
                          {log.details || log.user_agent || '-'}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {page} of {totalPages} ({total} total events)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

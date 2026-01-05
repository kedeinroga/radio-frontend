'use client'

import { useState, useEffect } from 'react'
import { Monitor, Smartphone, Tablet, MapPin, Calendar, X, Loader2, Trash2 } from 'lucide-react'

interface SessionInfo {
  session_id: string
  token_id: string
  device_info?: {
    browser?: string
    os?: string
    device_type?: string
    user_agent?: string
  }
  location?: {
    ip?: string
    city?: string
    country?: string
  }
  created_at: string
  last_activity: string
  expires_at: string
  is_current: boolean
}

export function ActiveSessionsManager() {
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingSession, setDeletingSession] = useState<string | null>(null)

  const loadSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/auth/sessions', {
        credentials: 'include',
        signal: AbortSignal.timeout(5000),
      })
      
      if (!response.ok) {
        throw new Error('Failed to load sessions')
      }
      
      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      setDeletingSession(sessionId)
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
        signal: AbortSignal.timeout(5000),
      })
      
      if (!response.ok) {
        throw new Error('Failed to revoke session')
      }
      
      await loadSessions()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDeletingSession(null)
    }
  }

  const handleRevokeAll = async () => {
    const otherSessions = sessions.filter(s => !s.is_current)
    for (const session of otherSessions) {
      await handleDeleteSession(session.session_id)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  const getDeviceIcon = (deviceType?: string) => {
    if (!deviceType) return <Monitor className="h-5 w-5" />
    
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />
      case 'tablet':
        return <Tablet className="h-5 w-5" />
      default:
        return <Monitor className="h-5 w-5" />
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <p className="font-semibold">Error</p>
        <p>{error}</p>
        <button
          onClick={loadSessions}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <h3 className="text-base sm:text-lg font-semibold">
          Active Sessions ({sessions.length})
        </h3>
        {sessions.length > 1 && (
          <button
            onClick={handleRevokeAll}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Revoke All Others
          </button>
        )}
      </div>

      {sessions.length === 0 && (
        <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
          No active sessions found
        </div>
      )}

      <div className="grid gap-3 sm:gap-4">
        {sessions.map((session) => (
          <div
            key={session.session_id}
            className={`p-4 border rounded-lg ${
              session.is_current
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex items-start space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="mt-1 text-gray-600 dark:text-gray-400 flex-shrink-0">
                  {getDeviceIcon(session.device_info?.device_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-white break-words">
                      {(() => {
                        const browser = session.device_info?.browser
                        const os = session.device_info?.os
                        const userAgent = session.device_info?.user_agent
                        
                        // Check if browser and os are valid (not "Unknown" or empty)
                        const validBrowser = browser && browser !== 'Unknown' && browser.trim() !== ''
                        const validOs = os && os !== 'Unknown' && os.trim() !== ''
                        
                        if (validBrowser && validOs) {
                          return `${browser} on ${os}`
                        } else if (userAgent && userAgent !== 'node' && userAgent.trim() !== '') {
                          return userAgent.length > 60 ? userAgent.substring(0, 60) + '...' : userAgent
                        } else {
                          return 'Web Browser'
                        }
                      })()}
                    </h4>
                    {session.is_current && (
                      <span className="px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 rounded-full inline-block">
                        Current
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-2 space-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {session.location && session.location.ip && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="break-all">
                          {session.location.city && session.location.city.trim() !== '' && 
                           session.location.country && session.location.country.trim() !== ''
                            ? `${session.location.city}, ${session.location.country}`
                            : session.location.ip === '::1' || session.location.ip === '127.0.0.1'
                            ? 'Local Network (localhost)'
                            : session.location.ip}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span>Last activity: {formatDate(session.last_activity)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {!session.is_current && (
                <button
                  onClick={() => handleDeleteSession(session.session_id)}
                  disabled={deletingSession === session.session_id}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
                  title="Revoke this session"
                >
                  {deletingSession === session.session_id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

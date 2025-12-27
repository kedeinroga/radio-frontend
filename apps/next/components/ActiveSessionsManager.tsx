'use client'

import { useState, useEffect } from 'react'
import { SessionValidator, SessionInfo, WebSecureStorage } from '@radio-app/app'
import { Monitor, Smartphone, Tablet, MapPin, Calendar, X } from 'lucide-react'

const storage = new WebSecureStorage()

/**
 * Active Sessions Manager Component
 * Displays all active sessions for the current user
 * Allows users to revoke/delete sessions
 */
export function ActiveSessionsManager() {
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load sessions from backend
   */
  const loadSessions = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = await storage.getItem('access_token')
      if (!token) {
        setError('No access token found')
        return
      }

      const sessionsData = await SessionValidator.getSessions(token)
      setSessions(sessionsData)
    } catch (err) {
      console.error('Failed to load sessions:', err)
      setError('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Delete a specific session
   */
  const handleDeleteSession = async (sessionId: string, isCurrent: boolean) => {
    if (isCurrent) {
      alert('Cannot delete current session')
      return
    }

    if (!confirm('Are you sure you want to revoke this session?')) {
      return
    }

    try {
      const token = await storage.getItem('access_token')
      if (!token) {
        setError('No access token found')
        return
      }

      const success = await SessionValidator.deleteSession(token, sessionId)
      
      if (success) {
        // Remove from list
        setSessions(prev => prev.filter(s => s.session_id !== sessionId))
      } else {
        alert('Failed to delete session')
      }
    } catch (err) {
      console.error('Failed to delete session:', err)
      alert('Failed to delete session')
    }
  }

  /**
   * Revoke all sessions except current
   */
  const handleRevokeAll = async () => {
    if (!confirm('This will log you out from all other devices. Continue?')) {
      return
    }

    try {
      const token = await storage.getItem('access_token')
      if (!token) {
        setError('No access token found')
        return
      }

      const revokedCount = await SessionValidator.revokeAllSessions(token)
      
      if (revokedCount > 0) {
        alert(`${revokedCount} sessions revoked successfully`)
        await loadSessions()
      } else {
        alert('No sessions to revoke')
      }
    } catch (err) {
      console.error('Failed to revoke sessions:', err)
      alert('Failed to revoke sessions')
    }
  }

  /**
   * Get device icon based on device type
   */
  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />
      case 'tablet':
        return <Tablet className="w-5 h-5" />
      default:
        return <Monitor className="w-5 h-5" />
    }
  }

  /**
   * Format date
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  /**
   * Load sessions on mount
   */
  useEffect(() => {
    loadSessions()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Active Sessions ({sessions.length})
        </h3>
        {sessions.length > 1 && (
          <button
            onClick={handleRevokeAll}
            className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Revoke All Others
          </button>
        )}
      </div>

      {/* Sessions List */}
      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.session_id}
            className={`p-4 rounded-lg border ${
              session.is_current
                ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
            }`}
          >
            <div className="flex items-start justify-between">
              {/* Device Info */}
              <div className="flex items-start gap-3 flex-1">
                <div className="text-gray-600 dark:text-gray-400 mt-1">
                  {getDeviceIcon(session.device_info.device_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Device Name */}
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {session.device_info.browser} on {session.device_info.os}
                    </h4>
                    {session.is_current && (
                      <span className="px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400 rounded">
                        Current
                      </span>
                    )}
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {session.location.city}, {session.location.country} ({session.location.ip})
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Created: {formatDate(session.created_at)}</span>
                    </div>
                    <div>
                      Last active: {formatDate(session.last_activity)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              {!session.is_current && (
                <button
                  onClick={() => handleDeleteSession(session.session_id, session.is_current)}
                  className="ml-2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Revoke session"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No active sessions found
        </div>
      )}
    </div>
  )
}

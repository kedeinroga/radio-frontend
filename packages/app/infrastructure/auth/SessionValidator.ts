import apiClient from '../api/apiClient'
import { SecurityLog } from '../logging/SecurityLogger'

/**
 * Session Metadata from backend
 */
export interface SessionMetadata {
  ip_address: string
  user_agent: string
  last_activity: string
  browser?: string
  os?: string
  device_type?: string
  city?: string
  country?: string
}

/**
 * Token validation response from backend
 */
export interface TokenValidationResult {
  valid: boolean
  user_id?: string
  email?: string
  role?: 'admin' | 'user' | 'guest'
  expires_at?: string
  issued_at?: string
  token_id?: string
  session_metadata?: SessionMetadata
  reason?: 'expired' | 'invalid' | 'revoked' | 'malformed'
}

/**
 * Session information from backend
 */
export interface SessionInfo {
  session_id: string
  token_id: string
  device_info: {
    user_agent: string
    browser: string
    os: string
    device_type: string
  }
  location: {
    ip: string
    country: string
    city: string
  }
  created_at: string
  last_activity: string
  expires_at: string
  is_current: boolean
}

/**
 * Session Validator Service
 * Handles session validation and management with the backend
 */
export class SessionValidator {
  /**
   * Validates a token with the backend
   * @param token - The access token to validate
   * @param includeMetadata - Whether to include session metadata in response
   */
  static async validateToken(
    token: string,
    includeMetadata: boolean = false
  ): Promise<TokenValidationResult> {
    try {
      const response = await apiClient.post('/auth/validate', {
        include_metadata: includeMetadata,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      SecurityLog.sessionValidated(response.data.user_id, true)

      return {
        valid: true,
        ...response.data,
      }
    } catch (error: any) {
      const reason = error.response?.data?.error?.reason || 'invalid'
      
      SecurityLog.sessionValidated('unknown', false, reason)

      return {
        valid: false,
        reason: reason as 'expired' | 'invalid' | 'revoked' | 'malformed',
      }
    }
  }

  /**
   * Revokes a specific token
   * @param token - The access token to use for authentication
   * @param tokenId - The JWT ID to revoke
   */
  static async revokeToken(token: string, tokenId: string): Promise<boolean> {
    try {
      await apiClient.post('/auth/revoke', {
        token_id: tokenId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      SecurityLog.sessionRevoked('unknown', tokenId, 'manual')
      return true
    } catch (error) {

      return false
    }
  }

  /**
   * Revokes a specific session
   * @param token - The access token to use for authentication
   * @param sessionId - The session ID to revoke
   */
  static async revokeSession(token: string, sessionId: string): Promise<boolean> {
    try {
      await apiClient.post('/auth/revoke', {
        session_id: sessionId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      SecurityLog.sessionRevoked('unknown', sessionId, 'manual')
      return true
    } catch (error) {

      return false
    }
  }

  /**
   * Revokes all sessions for the current user
   * @param token - The access token to use for authentication
   */
  static async revokeAllSessions(token: string): Promise<number> {
    try {
      const response = await apiClient.post('/auth/revoke', {
        revoke_all: true,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const revokedCount = response.data.revoked_count || 0
      SecurityLog.sessionRevoked('unknown', 'all', 'revoke_all')
      
      return revokedCount
    } catch (error) {

      return 0
    }
  }

  /**
   * Gets all active sessions for the current user
   * @param token - The access token to use for authentication
   */
  static async getSessions(token: string): Promise<SessionInfo[]> {
    try {
      const response = await apiClient.get('/auth/sessions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.data.sessions || []
    } catch (error) {

      return []
    }
  }

  /**
   * Deletes a specific session
   * @param token - The access token to use for authentication
   * @param sessionId - The session ID to delete
   */
  static async deleteSession(token: string, sessionId: string): Promise<boolean> {
    try {
      await apiClient.delete(`/auth/sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      SecurityLog.sessionRevoked('unknown', sessionId, 'manual')
      return true
    } catch (error) {

      return false
    }
  }

  /**
   * Generates a device fingerprint for session tracking
   * This is a simple implementation - can be enhanced with more data points
   */
  static getDeviceFingerprint(): string {
    if (typeof window === 'undefined') {
      return 'server'
    }

    const ua = navigator.userAgent
    const language = navigator.language
    const platform = navigator.platform
    const screenRes = `${window.screen.width}x${window.screen.height}`
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    const fingerprint = `${ua}|${language}|${platform}|${screenRes}|${timezone}`
    
    // Simple hash function
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }

    return Math.abs(hash).toString(36)
  }

  /**
   * Stores the device fingerprint in localStorage
   */
  static storeDeviceFingerprint(): void {
    if (typeof window === 'undefined') return

    const fingerprint = this.getDeviceFingerprint()
    localStorage.setItem('@radio-app:device_fp', fingerprint)
  }

  /**
   * Checks if the current device fingerprint matches the stored one
   * Returns false if fingerprint has changed (possible session hijacking)
   */
  static validateDeviceFingerprint(): boolean {
    if (typeof window === 'undefined') return true

    const storedFingerprint = localStorage.getItem('@radio-app:device_fp')
    if (!storedFingerprint) {
      // First time - store it
      this.storeDeviceFingerprint()
      return true
    }

    const currentFingerprint = this.getDeviceFingerprint()
    return storedFingerprint === currentFingerprint
  }
}

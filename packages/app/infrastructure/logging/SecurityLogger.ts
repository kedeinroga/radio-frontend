/**
 * Security Logging Service
 * Logs security-related events for monitoring and analysis
 */

export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  RATE_LIMIT_TRIGGERED = 'RATE_LIMIT_TRIGGERED',
  TOKEN_REFRESH_SUCCESS = 'TOKEN_REFRESH_SUCCESS',
  TOKEN_REFRESH_FAILED = 'TOKEN_REFRESH_FAILED',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  ADMIN_ACCESS = 'ADMIN_ACCESS',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
}

export interface SecurityEvent {
  type: SecurityEventType
  timestamp: string
  userId?: string
  email?: string
  ipAddress?: string
  userAgent?: string
  details?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * Security Logger Class
 * Handles logging of security events
 */
class SecurityLogger {
  private events: SecurityEvent[] = []
  private maxStoredEvents = 100
  private storageKey = '@radio-app:security-logs'

  constructor() {
    this.loadStoredEvents()
  }

  /**
   * Log a security event
   */
  log(
    type: SecurityEventType,
    options?: {
      userId?: string
      email?: string
      details?: Record<string, any>
      severity?: 'low' | 'medium' | 'high' | 'critical'
    }
  ): void {
    const event: SecurityEvent = {
      type,
      timestamp: new Date().toISOString(),
      userId: options?.userId,
      email: options?.email,
      ipAddress: this.getClientIP(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      details: options?.details,
      severity: options?.severity || this.getDefaultSeverity(type),
    }

    this.events.push(event)
    
    // Keep only recent events
    if (this.events.length > this.maxStoredEvents) {
      this.events = this.events.slice(-this.maxStoredEvents)
    }

    // Store in localStorage
    this.storeEvents()

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(event)
    }

    // Send to backend for critical events
    if (event.severity === 'critical' || event.severity === 'high') {
      this.sendToBackend(event)
    }
  }

  /**
   * Get all logged events
   */
  getEvents(): SecurityEvent[] {
    return [...this.events]
  }

  /**
   * Get events by type
   */
  getEventsByType(type: SecurityEventType): SecurityEvent[] {
    return this.events.filter(event => event.type === type)
  }

  /**
   * Get events by severity
   */
  getEventsBySeverity(severity: 'low' | 'medium' | 'high' | 'critical'): SecurityEvent[] {
    return this.events.filter(event => event.severity === severity)
  }

  /**
   * Get recent failed login attempts
   */
  getRecentFailedLogins(minutes: number = 15): SecurityEvent[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString()
    return this.events.filter(
      event => 
        event.type === SecurityEventType.LOGIN_FAILED && 
        event.timestamp > cutoff
    )
  }

  /**
   * Clear all stored events
   */
  clear(): void {
    this.events = []
    this.storeEvents()
  }

  /**
   * Export events as JSON
   */
  export(): string {
    return JSON.stringify(this.events, null, 2)
  }

  /**
   * Get default severity for event type
   */
  private getDefaultSeverity(type: SecurityEventType): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<SecurityEventType, 'low' | 'medium' | 'high' | 'critical'> = {
      [SecurityEventType.LOGIN_SUCCESS]: 'low',
      [SecurityEventType.LOGIN_FAILED]: 'medium',
      [SecurityEventType.LOGOUT]: 'low',
      [SecurityEventType.RATE_LIMIT_TRIGGERED]: 'high',
      [SecurityEventType.TOKEN_REFRESH_SUCCESS]: 'low',
      [SecurityEventType.TOKEN_REFRESH_FAILED]: 'medium',
      [SecurityEventType.UNAUTHORIZED_ACCESS]: 'high',
      [SecurityEventType.INVALID_TOKEN]: 'medium',
      [SecurityEventType.SESSION_EXPIRED]: 'low',
      [SecurityEventType.ADMIN_ACCESS]: 'medium',
      [SecurityEventType.SUSPICIOUS_ACTIVITY]: 'critical',
      [SecurityEventType.VALIDATION_ERROR]: 'low',
      [SecurityEventType.XSS_ATTEMPT]: 'critical',
      [SecurityEventType.SQL_INJECTION_ATTEMPT]: 'critical',
    }

    return severityMap[type] || 'medium'
  }

  /**
   * Get client IP (best effort - limited in browser)
   */
  private getClientIP(): string | undefined {
    // In browser, we can't directly get IP
    // This would need to come from backend
    return undefined
  }

  /**
   * Log to console with formatting
   */
  private logToConsole(event: SecurityEvent): void {
    const emoji = {
      low: '🟢',
      medium: '🟡',
      high: '🟠',
      critical: '🔴',
    }[event.severity]

    console.log(
      `${emoji} [SECURITY] ${event.type}`,
      {
        timestamp: event.timestamp,
        userId: event.userId,
        email: event.email,
        severity: event.severity,
        ...event.details,
      }
    )
  }

  /**
   * Store events in localStorage
   */
  private storeEvents(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.events))
    } catch (error) {
      console.error('Failed to store security logs:', error)
    }
  }

  /**
   * Load events from localStorage
   */
  private loadStoredEvents(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        this.events = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load security logs:', error)
      this.events = []
    }
  }

  /**
   * Send event to backend
   */
  private async sendToBackend(event: SecurityEvent): Promise<void> {
    // TODO: Implement backend logging endpoint
    // This should send critical security events to your backend
    // for persistent storage and analysis
    
    try {
      // Example:
      // await fetch('/api/security/log', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // })
      
      // For now, just log that we would send it
      if (process.env.NODE_ENV === 'development') {
        console.log('[SECURITY] Would send to backend:', event)
      }
    } catch (error) {
      console.error('Failed to send security event to backend:', error)
    }
  }
}

// Singleton instance
export const securityLogger = new SecurityLogger()

/**
 * Convenience functions for common security events
 */
export const SecurityLog = {
  loginSuccess: (userId: string, email: string) => {
    securityLogger.log(SecurityEventType.LOGIN_SUCCESS, {
      userId,
      email,
      severity: 'low',
    })
  },

  loginFailed: (email: string, reason?: string) => {
    securityLogger.log(SecurityEventType.LOGIN_FAILED, {
      email,
      details: { reason },
      severity: 'medium',
    })
  },

  rateLimitTriggered: (email: string, attempts: number) => {
    securityLogger.log(SecurityEventType.RATE_LIMIT_TRIGGERED, {
      email,
      details: { attempts },
      severity: 'high',
    })
  },

  unauthorizedAccess: (path: string, userId?: string) => {
    securityLogger.log(SecurityEventType.UNAUTHORIZED_ACCESS, {
      userId,
      details: { path },
      severity: 'high',
    })
  },

  adminAccess: (userId: string, email: string, action: string) => {
    securityLogger.log(SecurityEventType.ADMIN_ACCESS, {
      userId,
      email,
      details: { action },
      severity: 'medium',
    })
  },

  suspiciousActivity: (userId: string | undefined, description: string, details?: Record<string, any>) => {
    securityLogger.log(SecurityEventType.SUSPICIOUS_ACTIVITY, {
      userId,
      details: { description, ...details },
      severity: 'critical',
    })
  },

  validationError: (field: string, error: string) => {
    securityLogger.log(SecurityEventType.VALIDATION_ERROR, {
      details: { field, error },
      severity: 'low',
    })
  },

  xssAttempt: (input: string, context: string) => {
    securityLogger.log(SecurityEventType.XSS_ATTEMPT, {
      details: { input: input.substring(0, 100), context },
      severity: 'critical',
    })
  },

  sessionValidated: (userId: string, valid: boolean, reason?: string) => {
    securityLogger.log(SecurityEventType.SESSION_EXPIRED, {
      userId,
      details: { valid, reason },
      severity: valid ? 'low' : 'medium',
    })
  },

  sessionRevoked: (userId: string, targetId: string, reason: string) => {
    securityLogger.log(SecurityEventType.SUSPICIOUS_ACTIVITY, {
      userId,
      details: { action: 'session_revoked', targetId, reason },
      severity: 'medium',
    })
  },
}

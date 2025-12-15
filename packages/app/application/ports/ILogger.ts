/**
 * Logger Interface
 * Abstraction for logging service
 */
export interface ILogger {
  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, any>): void

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>): void

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>): void

  /**
   * Log error message
   */
  error(message: string, context?: Record<string, any>): void

  /**
   * Log fatal error
   */
  fatal(message: string, context?: Record<string, any>): void
}

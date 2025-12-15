import { ILogger } from '../../application/ports/ILogger'

/**
 * Console Logger
 * Simple logger implementation for development
 */
export class ConsoleLogger implements ILogger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  debug(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '')
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '')
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    console.warn(`[WARN] ${message}`, context || '')
  }

  error(message: string, context?: Record<string, any>): void {
    console.error(`[ERROR] ${message}`, context || '')
  }

  fatal(message: string, context?: Record<string, any>): void {
    console.error(`[FATAL] ${message}`, context || '')
  }
}

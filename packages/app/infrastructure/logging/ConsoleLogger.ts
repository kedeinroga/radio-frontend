import { ILogger } from '../../application/ports/ILogger'

/**
 * Console Logger
 * Simple logger implementation for development
 */
export class ConsoleLogger implements ILogger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  debug(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(message, context)
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(message, context)
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    // eslint-disable-next-line no-console
    console.warn(message, context)
  }

  error(message: string, context?: Record<string, any>): void {
    // eslint-disable-next-line no-console
    console.error(message, context)
  }

  fatal(message: string, context?: Record<string, any>): void {
    // eslint-disable-next-line no-console
    console.error('[FATAL]', message, context)
  }
}

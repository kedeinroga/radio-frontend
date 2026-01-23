import { ILogger } from '../../application/ports/ILogger'

/**
 * Console Logger
 * Simple logger implementation for development
 */
export class ConsoleLogger implements ILogger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  debug(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {

    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.isDevelopment) {

    }
  }

  warn(message: string, context?: Record<string, any>): void {

  }

  error(message: string, context?: Record<string, any>): void {

  }

  fatal(message: string, context?: Record<string, any>): void {

  }
}

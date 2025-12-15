/**
 * Base Domain Error
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/**
 * Station Not Found Error
 */
export class StationNotFoundError extends DomainError {
  constructor(stationId: string) {
    super(`Station with id "${stationId}" not found`)
  }
}

/**
 * Authentication Error
 */
export class AuthenticationError extends DomainError {
  constructor(message: string = 'Authentication failed') {
    super(message)
  }
}

/**
 * Authorization Error (e.g., premium required)
 */
export class AuthorizationError extends DomainError {
  constructor(message: string = 'Access denied') {
    super(message)
  }
}

/**
 * Premium Required Error
 */
export class PremiumRequiredError extends AuthorizationError {
  constructor(message: string = 'This feature requires a premium account') {
    super(message)
  }
}

/**
 * Playback Error
 */
export class PlaybackError extends DomainError {
  constructor(message: string) {
    super(`Playback error: ${message}`)
  }
}

/**
 * Network Error
 */
export class NetworkError extends DomainError {
  constructor(message: string = 'Network request failed') {
    super(message)
  }
}

/**
 * Validation Error
 */
export class ValidationError extends DomainError {
  constructor(message: string) {
    super(`Validation error: ${message}`)
  }
}

/**
 * Already Exists Error (e.g., already favorited)
 */
export class AlreadyExistsError extends DomainError {
  constructor(resource: string) {
    super(`${resource} already exists`)
  }
}

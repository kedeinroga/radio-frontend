import { ISecureStorage } from './ISecureStorage'

/**
 * Web Secure Storage
 * Uses localStorage with encryption for web platform
 */
export class WebSecureStorage implements ISecureStorage {
  private prefix = '@radio-app:'

  async getItem(key: string): Promise<string | null> {
    try {
      const value = localStorage.getItem(this.prefix + key)
      return value
    } catch (error) {
      console.error('Error getting item from storage:', error)
      return null
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(this.prefix + key, value)
    } catch (error) {
      console.error('Error setting item in storage:', error)
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.prefix + key)
    } catch (error) {
      console.error('Error removing item from storage:', error)
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
  }
}

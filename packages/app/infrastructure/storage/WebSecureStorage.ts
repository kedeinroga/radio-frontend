import { ISecureStorage } from './ISecureStorage'
import { encrypt, decrypt, isEncryptionAvailable } from '../utils/cryptoHelpers'

/**
 * Web Secure Storage
 * Uses localStorage with AES-GCM encryption for web platform
 * 
 * Security features:
 * - AES-GCM 256-bit encryption
 * - Device-specific encryption key (browser fingerprint)
 * - Random IV for each encryption
 * - Backward compatible with unencrypted data
 */
export class WebSecureStorage implements ISecureStorage {
  private prefix = '@radio-app:'
  private useEncryption = isEncryptionAvailable()

  constructor() {
    if (!this.useEncryption) {

    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const encrypted = localStorage.getItem(this.prefix + key)
      if (!encrypted) return null
      
      // Decrypt if encryption is available
      if (this.useEncryption) {
        return await decrypt(encrypted)
      }
      
      return encrypted
    } catch (error) {

      return null
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      // Encrypt if encryption is available
      const dataToStore = this.useEncryption 
        ? await encrypt(value)
        : value
      
      localStorage.setItem(this.prefix + key, dataToStore)
    } catch (error) {

    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.prefix + key)
    } catch (error) {

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

    }
  }
}

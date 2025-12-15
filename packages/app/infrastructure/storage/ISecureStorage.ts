/**
 * Secure Storage Interface
 * Abstraction for platform-specific secure storage
 */
export interface ISecureStorage {
  /**
   * Get item from secure storage
   */
  getItem(key: string): Promise<string | null>

  /**
   * Set item in secure storage
   */
  setItem(key: string, value: string): Promise<void>

  /**
   * Remove item from secure storage
   */
  removeItem(key: string): Promise<void>

  /**
   * Clear all items from secure storage
   */
  clear(): Promise<void>
}

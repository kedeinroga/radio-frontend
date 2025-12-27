/**
 * Crypto Helpers
 * Utilities for encryption and decryption using Web Crypto API
 */

/**
 * Generates a cryptographic key from a password
 * Uses PBKDF2 to derive a key from the user's device fingerprint
 */
async function getEncryptionKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  
  // Use a combination of factors for key derivation
  // This creates a unique key per browser/device
  const keyMaterial = [
    navigator.userAgent,
    navigator.language,
    screen.width.toString(),
    screen.height.toString(),
    new Date().getTimezoneOffset().toString(),
  ].join('|')
  
  // Import key material
  const passwordKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(keyMaterial),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )
  
  // Derive encryption key using PBKDF2
  // Salt should be stored, but for client-side encryption, we use a deterministic approach
  const salt = encoder.encode('radio-app-salt-v1') // Static salt for consistency
  
  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypts a string using AES-GCM
 * @param plaintext - The text to encrypt
 * @returns Base64 encoded encrypted data with IV
 */
export async function encrypt(plaintext: string): Promise<string> {
  try {
    if (typeof window === 'undefined' || !window.crypto?.subtle) {
      // Fallback for non-browser environments
      return plaintext
    }

    const encoder = new TextEncoder()
    const data = encoder.encode(plaintext)
    
    // Generate random IV (Initialization Vector)
    const iv = window.crypto.getRandomValues(new Uint8Array(12))
    
    // Get encryption key
    const key = await getEncryptionKey()
    
    // Encrypt data
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      data
    )
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(encrypted), iv.length)
    
    // Convert to base64
    return arrayBufferToBase64(combined)
  } catch (error) {
    console.error('Encryption error:', error)
    // In case of error, return plaintext (fallback)
    // In production, you might want to handle this differently
    return plaintext
  }
}

/**
 * Decrypts a string encrypted with encrypt()
 * @param ciphertext - Base64 encoded encrypted data with IV
 * @returns Decrypted plaintext
 */
export async function decrypt(ciphertext: string): Promise<string> {
  try {
    if (typeof window === 'undefined' || !window.crypto?.subtle) {
      // Fallback for non-browser environments
      return ciphertext
    }

    // Convert from base64
    const combined = base64ToArrayBuffer(ciphertext)
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)
    
    // Get encryption key
    const key = await getEncryptionKey()
    
    // Decrypt data
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encrypted
    )
    
    // Convert to string
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error('Decryption error:', error)
    // If decryption fails, might be unencrypted data (backward compatibility)
    return ciphertext
  }
}

/**
 * Converts ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * Converts Base64 string to Uint8Array
 */
function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Checks if encryption is available in the current environment
 */
export function isEncryptionAvailable(): boolean {
  return typeof window !== 'undefined' && 
         !!window.crypto?.subtle &&
         !!window.crypto.subtle.encrypt &&
         !!window.crypto.subtle.decrypt
}

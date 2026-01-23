/**
 * CSRF Protection Utilities
 * 
 * Implementa generación y validación de tokens CSRF para proteger
 * contra ataques Cross-Site Request Forgery.
 */

/**
 * Genera un token CSRF seguro usando crypto
 */
export function generateCSRFToken(): string {
  // Generar 32 bytes aleatorios y convertir a base64
  const array = new Uint8Array(32)
  
  if (typeof window !== 'undefined' && window.crypto) {
    // Browser environment
    window.crypto.getRandomValues(array)
  } else if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    // Node.js 19+ or Edge Runtime
    globalThis.crypto.getRandomValues(array)
  } else {
    // Fallback (menos seguro, solo para desarrollo)
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }
  
  // Convertir a base64 URL-safe
  const base64 = btoa(String.fromCharCode(...array))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * Almacena el token CSRF en una cookie httpOnly
 * 
 * NOTA: En Next.js, las cookies httpOnly solo se pueden establecer desde
 * el servidor (API routes o Server Components). Esta función es para
 * el cliente y usa cookies regulares.
 */
export function setCSRFCookie(token: string): void {
  if (typeof document === 'undefined') return
  
  const cookieValue = `csrf_token=${token}; Path=/; SameSite=Strict; Secure; Max-Age=3600`
  document.cookie = cookieValue
}

/**
 * Obtiene el token CSRF de las cookies
 */
export function getCSRFCookie(): string | null {
  if (typeof document === 'undefined') return null
  
  const cookies = document.cookie.split('; ')
  const csrfCookie = cookies.find(c => c.startsWith('csrf_token='))
  
  if (!csrfCookie) return null
  
  return csrfCookie.split('=')[1]
}

/**
 * Valida que un token CSRF coincida con el almacenado en cookies
 * 
 * IMPORTANTE: Esta validación debe hacerse en el servidor para ser segura.
 * Esta función es solo para uso en el cliente como pre-validación.
 */
export function validateCSRFToken(token: string): boolean {
  const storedToken = getCSRFCookie()
  
  if (!storedToken || !token) {
    return false
  }
  
  // Comparación constant-time para prevenir timing attacks
  return constantTimeCompare(token, storedToken)
}

/**
 * Comparación de strings en tiempo constante
 * Previene timing attacks al comparar tokens
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

/**
 * Elimina el token CSRF de las cookies
 */
export function clearCSRFCookie(): void {
  if (typeof document === 'undefined') return
  
  document.cookie = 'csrf_token=; Path=/; Max-Age=0'
}

/**
 * Hook para obtener o generar un token CSRF
 * 
 * Uso:
 * ```typescript
 * const csrfToken = useCSRFToken()
 * 
 * fetch('/api/checkout', {
 *   headers: {
 *     'X-CSRF-Token': csrfToken
 *   }
 * })
 * ```
 */
export function useCSRFToken(): string {
  if (typeof window === 'undefined') {
    // Server-side: generar token temporal (será reemplazado en el cliente)
    return ''
  }
  
  // Intentar obtener token existente
  let token = getCSRFCookie()
  
  // Si no existe, generar uno nuevo
  if (!token) {
    token = generateCSRFToken()
    setCSRFCookie(token)
  }
  
  return token
}

/**
 * Agrega el header CSRF a un objeto de headers
 */
export function addCSRFHeader(headers: HeadersInit = {}): HeadersInit {
  const token = getCSRFCookie()
  
  if (!token) {
    return headers
  }
  
  return {
    ...headers,
    'X-CSRF-Token': token,
  }
}

/**
 * Wrapper de fetch que automáticamente agrega el token CSRF
 */
export async function fetchWithCSRF(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getCSRFCookie()
  
  if (!token) {
    // Generar token si no existe
    const newToken = generateCSRFToken()
    setCSRFCookie(newToken)
  }
  
  return fetch(url, {
    ...options,
    headers: addCSRFHeader(options.headers),
  })
}

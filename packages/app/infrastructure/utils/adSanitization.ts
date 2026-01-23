/**
 * Ad Sanitization Utilities
 * 
 * Sanitiza contenido de anuncios para prevenir ataques XSS.
 * CRÍTICO: Todas las URLs y textos de ads deben pasar por estas funciones.
 */

/**
 * Sanitiza una URL de anuncio para prevenir XSS
 * 
 * @param url - URL a sanitizar
 * @returns URL sanitizada o '#' si es inválida
 * 
 * @example
 * sanitizeAdUrl('https://example.com') // OK
 * sanitizeAdUrl('javascript:alert(1)') // '#' - bloqueado
 * sanitizeAdUrl('data:text/html,<script>') // '#' - bloqueado
 */
export function sanitizeAdUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '#'
  }
  
  // Trim whitespace y convertir a lowercase para checks
  const trimmedUrl = url.trim()
  const lowerUrl = trimmedUrl.toLowerCase()
  
  // Bloquear protocolos peligrosos
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
  ]
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {

      return '#'
    }
  }
  
  // Intentar parsear como URL válida
  try {
    const parsed = new URL(trimmedUrl)
    
    // Solo permitir http y https
    if (!['http:', 'https:'].includes(parsed.protocol)) {

      return '#'
    }
    
    // Verificar que no tenga caracteres sospechosos
    if (trimmedUrl.includes('<') || trimmedUrl.includes('>')) {

      return '#'
    }
    
    return trimmedUrl
  } catch (error) {
    // URL inválida

    return '#'
  }
}

/**
 * Valida que una URL de media tenga una extensión permitida
 * 
 * @param mediaUrl - URL del archivo de media
 * @param adType - Tipo de ad ('image' | 'video' | 'audio')
 * @returns true si la extensión es válida
 */
export function validateAdMedia(
  mediaUrl: string,
  adType: 'image' | 'video' | 'audio' | 'html'
): boolean {
  if (!mediaUrl || typeof mediaUrl !== 'string') {
    return false
  }
  
  const url = mediaUrl.toLowerCase()
  
  // Extensiones permitidas por tipo
  const allowedExtensions = {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    video: ['.mp4', '.webm', '.ogg'],
    audio: ['.mp3', '.ogg', '.wav', '.m4a', '.aac'],
    html: [], // HTML ads no usan media files
  }
  
  const extensions = allowedExtensions[adType]
  
  // HTML ads no tienen media URL
  if (adType === 'html') {
    return true
  }
  
  // Verificar que termine con una extensión válida
  return extensions.some(ext => url.endsWith(ext))
}

/**
 * Sanitiza texto de anuncio para prevenir inyección HTML
 * 
 * @param text - Texto a sanitizar
 * @returns Texto sanitizado con HTML entities escapados
 * 
 * @example
 * sanitizeAdText('Hello <script>alert(1)</script>')
 * // 'Hello &lt;script&gt;alert(1)&lt;/script&gt;'
 */
export function sanitizeAdText(text: string): string {
  if (!text || typeof text !== 'string') {
    return ''
  }
  
  return text
    .replace(/&/g, '&amp;')   // & debe ir primero
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Lista blanca de dominios permitidos para ads (opcional)
 * En producción, deberías mantener una lista de dominios confiables.
 */
const ALLOWED_AD_DOMAINS: string[] = [
  // Agregar dominios de anunciantes confiables
  // 'googleads.com',
  // 'doubleclick.net',
  // 'facebook.com',
]

/**
 * Verifica si un dominio está en la lista blanca (opcional)
 * 
 * @param url - URL a verificar
 * @returns true si el dominio está permitido o si no hay whitelist
 */
export function isAllowedAdDomain(url: string): boolean {
  // Si no hay whitelist configurada, permitir todos
  if (ALLOWED_AD_DOMAINS.length === 0) {
    return true
  }
  
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname
    
    return ALLOWED_AD_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}

/**
 * Sanitiza completamente un objeto Advertisement
 * 
 * @param ad - Advertisement a sanitizar
 * @returns Advertisement sanitizado
 */
export function sanitizeAdvertisement<T extends {
  clickUrl: string
  mediaUrl?: string
  companionBannerUrl?: string
  title: string
  description?: string
  adType: 'image' | 'video' | 'audio' | 'html'
}>(ad: T): T {
  return {
    ...ad,
    // Sanitizar URLs
    clickUrl: sanitizeAdUrl(ad.clickUrl),
    mediaUrl: ad.mediaUrl ? sanitizeAdUrl(ad.mediaUrl) : undefined,
    companionBannerUrl: ad.companionBannerUrl 
      ? sanitizeAdUrl(ad.companionBannerUrl) 
      : undefined,
    
    // Sanitizar texto
    title: sanitizeAdText(ad.title),
    description: ad.description 
      ? sanitizeAdText(ad.description) 
      : undefined,
  }
}

/**
 * Valida que un ad tenga todos los campos requeridos sanitizados
 * 
 * @param ad - Advertisement a validar
 * @returns Objeto con resultado de validación
 */
export function validateAdvertisementSafety(ad: {
  clickUrl: string
  mediaUrl?: string
  adType: 'image' | 'video' | 'audio' | 'html'
}): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Validar click URL
  const sanitizedClickUrl = sanitizeAdUrl(ad.clickUrl)
  if (sanitizedClickUrl === '#') {
    errors.push('Invalid or dangerous click URL')
  }
  
  // Validar media URL si existe
  if (ad.mediaUrl) {
    const sanitizedMediaUrl = sanitizeAdUrl(ad.mediaUrl)
    if (sanitizedMediaUrl === '#') {
      errors.push('Invalid or dangerous media URL')
    }
    
    // Validar extensión del archivo
    if (!validateAdMedia(ad.mediaUrl, ad.adType)) {
      errors.push(`Invalid media file extension for ad type: ${ad.adType}`)
    }
  }
  
  // Validar dominio si hay whitelist
  if (ALLOWED_AD_DOMAINS.length > 0 && !isAllowedAdDomain(ad.clickUrl)) {
    errors.push('Click URL domain is not in the allowed list')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Sanitiza HTML content (para HTML ads)
 * NOTA: Solo usar con contenido de anunciantes confiables
 * 
 * @param html - HTML a sanitizar
 * @returns HTML sanitizado con solo tags permitidos
 */
export function sanitizeAdHTML(html: string): string {
  if (!html || typeof html !== 'string') {
    return ''
  }
  
  // Tags permitidos para HTML ads (para futuro uso con DOMPurify)
  // const allowedTags = [
  //   'div', 'span', 'p', 'a', 'img', 'br',
  //   'strong', 'em', 'b', 'i', 'u',
  // ]
  
  // Atributos permitidos (para futuro uso con DOMPurify)
  // const allowedAttributes = [
  //   'href', 'src', 'alt', 'title', 'class', 'id',
  //   'width', 'height', 'style',
  // ]
  
  // Esta es una sanitización básica
  // En producción, usar una librería como DOMPurify
  let sanitized = html
  
  // Remover script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remover event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Remover javascript: en hrefs
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')

  return sanitized
}

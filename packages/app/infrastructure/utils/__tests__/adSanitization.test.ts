/**
 * Tests for Ad Sanitization Utilities
 */

import { describe, it, expect } from 'vitest'
import {
  sanitizeAdUrl,
  validateAdMedia,
  sanitizeAdText,
  sanitizeAdvertisement,
  validateAdvertisementSafety,
} from '../adSanitization'

describe('sanitizeAdUrl', () => {
  it('should allow valid http URLs', () => {
    const url = 'http://example.com/ad'
    expect(sanitizeAdUrl(url)).toBe(url)
  })

  it('should allow valid https URLs', () => {
    const url = 'https://example.com/ad'
    expect(sanitizeAdUrl(url)).toBe(url)
  })

  it('should block javascript: protocol', () => {
    const url = 'javascript:alert(1)'
    expect(sanitizeAdUrl(url)).toBe('#')
  })

  it('should block data: protocol', () => {
    const url = 'data:text/html,<script>alert(1)</script>'
    expect(sanitizeAdUrl(url)).toBe('#')
  })

  it('should block vbscript: protocol', () => {
    const url = 'vbscript:msgbox'
    expect(sanitizeAdUrl(url)).toBe('#')
  })

  it('should block file: protocol', () => {
    const url = 'file:///etc/passwd'
    expect(sanitizeAdUrl(url)).toBe('#')
  })

  it('should block URLs with HTML characters', () => {
    const url = 'https://example.com/<script>'
    expect(sanitizeAdUrl(url)).toBe('#')
  })

  it('should handle invalid URLs', () => {
    expect(sanitizeAdUrl('not a url')).toBe('#')
    expect(sanitizeAdUrl('')).toBe('#')
  })

  it('should trim whitespace', () => {
    const url = '  https://example.com  '
    expect(sanitizeAdUrl(url)).toBe('https://example.com')
  })
})

describe('validateAdMedia', () => {
  it('should allow valid image extensions', () => {
    expect(validateAdMedia('https://cdn.com/ad.jpg', 'image')).toBe(true)
    expect(validateAdMedia('https://cdn.com/ad.png', 'image')).toBe(true)
    expect(validateAdMedia('https://cdn.com/ad.gif', 'image')).toBe(true)
    expect(validateAdMedia('https://cdn.com/ad.webp', 'image')).toBe(true)
  })

  it('should allow valid video extensions', () => {
    expect(validateAdMedia('https://cdn.com/ad.mp4', 'video')).toBe(true)
    expect(validateAdMedia('https://cdn.com/ad.webm', 'video')).toBe(true)
  })

  it('should allow valid audio extensions', () => {
    expect(validateAdMedia('https://cdn.com/ad.mp3', 'audio')).toBe(true)
    expect(validateAdMedia('https://cdn.com/ad.ogg', 'audio')).toBe(true)
    expect(validateAdMedia('https://cdn.com/ad.m4a', 'audio')).toBe(true)
  })

  it('should reject invalid extensions for image type', () => {
    expect(validateAdMedia('https://cdn.com/ad.mp4', 'image')).toBe(false)
    expect(validateAdMedia('https://cdn.com/ad.exe', 'image')).toBe(false)
  })

  it('should reject invalid extensions for video type', () => {
    expect(validateAdMedia('https://cdn.com/ad.jpg', 'video')).toBe(false)
  })

  it('should reject invalid extensions for audio type', () => {
    expect(validateAdMedia('https://cdn.com/ad.jpg', 'audio')).toBe(false)
  })

  it('should handle html type (no media validation)', () => {
    // HTML type doesn't require media URL, so empty URL returns false
    expect(validateAdMedia('', 'html')).toBe(false)
    // HTML type with any URL is still validated
    expect(validateAdMedia('https://example.com', 'html')).toBe(true)
  })

  it('should handle empty URLs', () => {
    expect(validateAdMedia('', 'image')).toBe(false)
  })
})

describe('sanitizeAdText', () => {
  it('should escape HTML entities', () => {
    const text = '<script>alert(1)</script>'
    expect(sanitizeAdText(text)).toBe('&lt;script&gt;alert(1)&lt;&#x2F;script&gt;')
  })

  it('should escape ampersands', () => {
    const text = 'Hello & World'
    expect(sanitizeAdText(text)).toBe('Hello &amp; World')
  })

  it('should escape quotes', () => {
    expect(sanitizeAdText('Hello "World"')).toContain('&quot;')
    expect(sanitizeAdText("Hello 'World'")).toContain('&#x27;')
  })

  it('should escape slashes', () => {
    const text = 'Hello/World'
    expect(sanitizeAdText(text)).toContain('&#x2F;')
  })

  it('should handle empty strings', () => {
    expect(sanitizeAdText('')).toBe('')
  })

  it('should handle normal text without changes', () => {
    const text = 'Hello World'
    expect(sanitizeAdText(text)).toBe('Hello World')
  })
})

describe('sanitizeAdvertisement', () => {
  it('should sanitize all URL fields', () => {
    const ad = {
      clickUrl: 'javascript:alert(1)',
      mediaUrl: 'https://example.com/image.jpg',
      companionBannerUrl: 'data:text/html',
      title: 'Test Ad',
      adType: 'image' as const,
    }

    const sanitized = sanitizeAdvertisement(ad)

    expect(sanitized.clickUrl).toBe('#')
    expect(sanitized.mediaUrl).toBe('https://example.com/image.jpg')
    expect(sanitized.companionBannerUrl).toBe('#')
  })

  it('should sanitize text fields', () => {
    const ad = {
      clickUrl: 'https://example.com',
      title: '<script>XSS</script>',
      description: 'Hello <b>World</b>',
      adType: 'image' as const,
    }

    const sanitized = sanitizeAdvertisement(ad)

    expect(sanitized.title).not.toContain('<script>')
    expect(sanitized.description).not.toContain('<b>')
  })

  it('should handle optional fields', () => {
    const ad = {
      clickUrl: 'https://example.com',
      title: 'Test',
      adType: 'audio' as const,
      mediaUrl: undefined,
      companionBannerUrl: undefined,
      description: undefined,
    }

    const sanitized = sanitizeAdvertisement(ad)

    expect(sanitized.mediaUrl).toBeUndefined()
    expect(sanitized.companionBannerUrl).toBeUndefined()
    expect(sanitized.description).toBeUndefined()
  })
})

describe('validateAdvertisementSafety', () => {
  it('should validate safe advertisements', () => {
    const ad = {
      clickUrl: 'https://example.com',
      mediaUrl: 'https://cdn.com/ad.jpg',
      adType: 'image' as const,
    }

    const result = validateAdvertisementSafety(ad)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should detect dangerous click URLs', () => {
    const ad = {
      clickUrl: 'javascript:alert(1)',
      adType: 'image' as const,
    }

    const result = validateAdvertisementSafety(ad)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Invalid or dangerous click URL')
  })

  it('should detect dangerous media URLs', () => {
    const ad = {
      clickUrl: 'https://example.com',
      mediaUrl: 'javascript:alert(1)',
      adType: 'image' as const,
    }

    const result = validateAdvertisementSafety(ad)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Invalid or dangerous media URL')
  })

  it('should detect invalid media file extensions', () => {
    const ad = {
      clickUrl: 'https://example.com',
      mediaUrl: 'https://cdn.com/ad.exe',
      adType: 'image' as const,
    }

    const result = validateAdvertisementSafety(ad)

    expect(result.valid).toBe(false)
    expect(result.errors.some(e => e.includes('Invalid media file extension'))).toBe(true)
  })

  it('should validate ads without media URL', () => {
    const ad = {
      clickUrl: 'https://example.com',
      adType: 'html' as const,
    }

    const result = validateAdvertisementSafety(ad)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })
})

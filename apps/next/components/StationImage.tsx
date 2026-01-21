/**
 * Optimized Station Image Component
 * 
 * Uses Next.js Image for automatic optimization:
 * - WebP/AVIF conversion
 * - Responsive sizing
 * - Lazy loading
 * - Blur placeholder
 * 
 * Performance benefits:
 * - 60-80% smaller images with WebP
 * - Automatic responsive srcset
 * - Better Core Web Vitals (LCP)
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'

interface StationImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  width?: number
  height?: number
  priority?: boolean
  sizes?: string
  fill?: boolean
}

/**
 * Optimized image component with fallback handling
 * 
 * Features:
 * - Next.js Image optimization (WebP, AVIF)
 * - Automatic error fallback to SVG placeholder
 * - Responsive sizing with srcset
 * - Blur placeholder for better UX
 * - Priority loading for above-the-fold images
 */
export function StationImage({ 
  src, 
  alt, 
  className = '',
  width = 400,
  height = 400,
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  fill = false,
}: StationImageProps) {
  const [imgError, setImgError] = useState(false)
  
  // Use default-radio.svg as fallback
  const imageSrc = imgError || !src ? '/default-radio.svg' : src
  
  // Disable Next.js optimization only for default image
  const unoptimized = (imgError || !src)

  if (fill) {
    return (
      <Image
        src={imageSrc}
        alt={alt}
        fill
        className={className}
        sizes={sizes}
        priority={priority}
        onError={() => setImgError(true)}
        unoptimized={unoptimized}
        placeholder="blur"
        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg=="
      />
    )
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setImgError(true)}
      unoptimized={unoptimized}
      placeholder="blur"
      blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2VlZSIvPjwvc3ZnPg=="
    />
  )
}


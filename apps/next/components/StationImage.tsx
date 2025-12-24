'use client'

import { useState } from 'react'

interface StationImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  loading?: 'eager' | 'lazy'
  priority?: boolean
}

/**
 * Client Component for station images with error handling
 * Handles onError event which requires client-side interactivity
 */
export function StationImage({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy' 
}: StationImageProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <img
      src={imgError || !src ? '/default-radio.png' : src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setImgError(true)}
    />
  )
}

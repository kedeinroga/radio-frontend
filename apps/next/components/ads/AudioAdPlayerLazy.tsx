/**
 * Lazy-Loaded AudioAdPlayer
 * 
 * Performance optimization: Load AudioAdPlayer only when needed.
 * Reduces initial bundle size by ~50KB (AudioAdPlayer + dependencies).
 * 
 * Usage:
 * ```tsx
 * import { AudioAdPlayerLazy } from '@/components/ads/AudioAdPlayerLazy'
 * 
 * <AudioAdPlayerLazy
 *   currentAd={ad}
 *   onAdStart={handleAdStart}
 *   onAdComplete={handleAdComplete}
 * />
 * ```
 */

'use client'

import dynamic from 'next/dynamic'
import type { AudioAdPlayerProps } from './AudioAdPlayer'

/**
 * Dynamically imported AudioAdPlayer with loading state
 * 
 * Benefits:
 * - Code splitting: AudioAdPlayer only loaded when ad is playing
 * - Reduced initial bundle: ~50KB saved on first load
 * - Better Core Web Vitals: Smaller FCP, LCP times
 */
export const AudioAdPlayerLazy = dynamic<AudioAdPlayerProps>(
  () => import('./AudioAdPlayer').then((mod) => mod.AudioAdPlayer),
  {
    loading: () => (
      <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-neutral-600 dark:text-neutral-400">
            Loading ad player...
          </p>
        </div>
      </div>
    ),
    ssr: false, // Ads don't need SSR (always client-side)
  }
)

/**
 * Dynamically imported MinimalAudioAdPlayer with loading state
 */
export const MinimalAudioAdPlayerLazy = dynamic(
  () => import('./AudioAdPlayer').then((mod) => mod.MinimalAudioAdPlayer),
  {
    loading: () => (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
    ssr: false,
  }
)

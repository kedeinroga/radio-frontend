'use client'

import React from 'react'

export interface LoadingSpinnerProps {
  size?: 'small' | 'large'
  message?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  message = 'Loading...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8" role="status" aria-live="polite">
      <div
        className={`animate-spin rounded-full border-4 border-primary-200 border-t-primary-500 ${
          size === 'large' ? 'h-12 w-12' : 'h-6 w-6'
        }`}
      />
      {message && (
        <p className="text-base text-neutral-600 dark:text-neutral-400 mt-4 text-center">
          {message}
        </p>
      )}
    </div>
  )
}

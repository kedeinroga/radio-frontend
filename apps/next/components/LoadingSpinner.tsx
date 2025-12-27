'use client'

import React from 'react'
import { useAppTranslation } from '@/hooks/useAppTranslation'

export interface LoadingSpinnerProps {
  size?: 'small' | 'large'
  message?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  message,
}) => {
  const { t } = useAppTranslation()
  const displayMessage = message || t('common.loading')
  
  return (
    <div className="flex flex-col items-center justify-center p-8" role="status" aria-live="polite">
      <div
        className={`animate-spin rounded-full border-4 border-primary-200 border-t-primary-500 ${
          size === 'large' ? 'h-12 w-12' : 'h-6 w-6'
        }`}
      />
      {displayMessage && (
        <p className="text-base text-neutral-600 dark:text-neutral-400 mt-4 text-center">
          {displayMessage}
        </p>
      )}
    </div>
  )
}

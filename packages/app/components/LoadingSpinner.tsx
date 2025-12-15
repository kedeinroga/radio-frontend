import React from 'react'
import { View, ActivityIndicator, Text } from 'react-native'

export interface LoadingSpinnerProps {
  size?: 'small' | 'large'
  message?: string
}

/**
 * Loading Spinner Component
 * Accessible loading indicator with optional message
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  message = 'Loading...',
}) => {
  return (
    <View
      className="flex-1 items-center justify-center p-8"
      accessible={true}
      accessibilityLabel={message}
      accessibilityRole="progressbar"
    >
      <ActivityIndicator size={size} color="#0ea5e9" />
      {message && (
        <Text className="text-base text-neutral-600 dark:text-neutral-400 mt-4 text-center">
          {message}
        </Text>
      )}
    </View>
  )
}

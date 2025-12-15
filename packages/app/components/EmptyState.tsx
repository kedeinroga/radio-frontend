import React from 'react'
import { View, Text } from 'react-native'
import { Button } from './Button'

export interface EmptyStateProps {
  icon: string
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

/**
 * Empty State Component
 * Displays when no content is available with optional action
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <View
      className="flex-1 items-center justify-center p-8"
      accessible={true}
      accessibilityLabel={`${title}. ${description}`}
    >
      <Text className="text-6xl mb-4" role="img" aria-label={icon}>
        {icon}
      </Text>

      <Text className="text-xl font-bold text-neutral-900 dark:text-white text-center mb-2">
        {title}
      </Text>

      <Text className="text-base text-neutral-600 dark:text-neutral-400 text-center mb-6">
        {description}
      </Text>

      {actionLabel && onAction && (
        <Button
          onPress={onAction}
          variant="primary"
          accessibilityLabel={actionLabel}
          accessibilityHint={`Navigate to ${actionLabel.toLowerCase()}`}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  )
}

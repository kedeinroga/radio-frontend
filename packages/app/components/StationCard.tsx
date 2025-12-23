import React from 'react'
import { View, Text, Image, Pressable } from 'react-native'
import { Station } from '../domain/entities/Station'

export interface StationCardProps {
  station: Station
  isFavorite?: boolean
  isPlaying?: boolean
  onPlay: () => void
  onFavorite: () => void
}

/**
 * Station Card Component
 * Displays station information with accessible controls
 */
export const StationCard: React.FC<StationCardProps> = ({
  station,
  isFavorite = false,
  isPlaying = false,
  onPlay,
  onFavorite,
}) => {
  const [imgError, setImgError] = React.useState(false)

  return (
    <View
      className="bg-white dark:bg-neutral-900 rounded-xl p-4 mb-3 shadow-sm"
      accessible={true}
      accessibilityLabel={`${station.name}, ${station.metadata}`}
      accessibilityHint="Double tap to view station details"
    >
      <View className="flex-row items-center gap-4">
        {/* Station Image */}
        <View className="w-20 h-20 rounded-lg bg-neutral-200 dark:bg-neutral-800 items-center justify-center overflow-hidden">
          {!imgError && station.imageUrl ? (
            <Image
              source={{ uri: station.imageUrl }}
              className="w-20 h-20 rounded-lg"
              accessibilityIgnoresInvertColors
              alt={`${station.name} logo`}
              onError={() => setImgError(true)}
            />
          ) : (
            <View className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 items-center justify-center">
              <Text className="text-3xl">📻</Text>
            </View>
          )}
        </View>

        {/* Station Info */}
        <View className="flex-1">
          <View className="flex-row items-center gap-2 mb-1">
            <Text
              className="text-lg font-bold text-neutral-900 dark:text-white flex-1"
              numberOfLines={1}
            >
              {station.name}
            </Text>
            {station.isPremium && (
              <View className="bg-warning px-2 py-0.5 rounded">
                <Text className="text-xs font-semibold text-white">PRO</Text>
              </View>
            )}
          </View>

          <Text className="text-sm text-neutral-600 dark:text-neutral-400" numberOfLines={1}>
            {station.metadata}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-2">
          {/* Play Button */}
          <Pressable
            onPress={onPlay}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pause station' : 'Play station'}
            accessibilityHint={`${isPlaying ? 'Pause' : 'Play'} ${station.name}`}
            className="w-12 h-12 bg-primary-500 rounded-full items-center justify-center active:bg-primary-600"
          >
            <Text className="text-white text-xl">{isPlaying ? '⏸' : '▶'}</Text>
          </Pressable>

          {/* Favorite Button */}
          <Pressable
            onPress={onFavorite}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            accessibilityHint={`${isFavorite ? 'Remove' : 'Add'} ${station.name} ${isFavorite ? 'from' : 'to'} favorites`}
            className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800 rounded-full items-center justify-center active:bg-neutral-200"
          >
            <Text className="text-xl">{isFavorite ? '❤️' : '🤍'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

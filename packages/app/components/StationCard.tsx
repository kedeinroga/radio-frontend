import React from 'react'
import { View, Text, Image, Pressable, StyleSheet } from 'react-native'
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
    <Pressable
      onPress={onPlay}
      accessible={true}
      accessibilityLabel={`${station.name}, ${station.metadata}`}
      accessibilityHint={isPlaying ? 'Double tap to pause' : 'Double tap to play'}
      style={styles.card}
    >
      <View style={styles.cardContent}>
        {/* Station Image */}
        <View style={styles.imageContainer}>
          {!imgError && station.imageUrl ? (
            <Image
              source={{ uri: station.imageUrl }}
              style={styles.image}
              accessibilityIgnoresInvertColors
              alt={`${station.name} logo`}
              onError={() => setImgError(true)}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderIcon}>📻</Text>
            </View>
          )}
        </View>

        {/* Station Info */}
        <View style={styles.infoContainer}>
          <View style={styles.titleRow}>
            <Text
              style={styles.stationName}
              numberOfLines={1}
            >
              {station.name}
            </Text>
            {station.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>PRO</Text>
              </View>
            )}
          </View>

          <Text style={styles.metadata} numberOfLines={1}>
            {station.metadata}
          </Text>
        </View>

        {/* Favorite Button */}
        <Pressable
          onPress={(e) => {
            e?.stopPropagation?.()
            onFavorite()
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          accessibilityHint={`${isFavorite ? 'Remove' : 'Add'} ${station.name} ${isFavorite ? 'from' : 'to'} favorites`}
          style={styles.favoriteButton}
        >
          <Text style={styles.favoriteIcon}>
            {isFavorite ? '♥' : '♡'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
  },
  placeholderIcon: {
    fontSize: 32,
  },
  infoContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#171717',
    flex: 1,
  },
  premiumBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  metadata: {
    fontSize: 14,
    color: '#737373',
  },
  favoriteButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteIcon: {
    fontSize: 24,
    color: '#ef4444',
  },
})

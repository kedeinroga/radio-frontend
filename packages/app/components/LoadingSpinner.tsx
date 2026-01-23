import React from 'react'
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native'

export interface LoadingSpinnerProps {
  size?: 'small' | 'large'
  message?: string
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  message: {
    fontSize: 16,
    color: '#525252',
    marginTop: 16,
    textAlign: 'center',
  },
})

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'large', message }) => {
  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityLabel={message}
      accessibilityRole="progressbar"
    >
      <ActivityIndicator size={size} color="#0ea5e9" />
      {message && (
        <Text style={styles.message}>
          {message}
        </Text>
      )}
    </View>
  )
}

export default LoadingSpinner

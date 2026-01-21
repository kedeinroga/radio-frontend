/**
 * Premium Features Component
 * 
 * Displays detailed list of Premium features with icons.
 */

'use client'

import { 
  Volume2, 
  Sparkles, 
  Zap, 
  Music, 
  Download, 
  Headphones,
  Shield,
  Smartphone
} from 'lucide-react'
import { useAppTranslation } from '@/hooks/useAppTranslation'

interface Feature {
  icon: React.ReactNode
  titleKey: string
  descriptionKey: string
}

export function PremiumFeatures() {
  const { t } = useAppTranslation()

  const FEATURES: Feature[] = [
    {
      icon: <Volume2 className="text-primary-600" size={32} />,
      titleKey: 'premium.benefits.noAds.title',
      descriptionKey: 'premium.benefits.noAds.description',
    },
    {
      icon: <Sparkles className="text-primary-600" size={32} />,
      titleKey: 'premium.benefits.superiorQuality.title',
      descriptionKey: 'premium.benefits.superiorQuality.description',
    },
    {
      icon: <Music className="text-primary-600" size={32} />,
      titleKey: 'premium.benefits.exclusiveStations.title',
      descriptionKey: 'premium.benefits.exclusiveStations.description',
    },
    {
      icon: <Zap className="text-primary-600" size={32} />,
      titleKey: 'premium.benefits.backgroundPlay.title',
      descriptionKey: 'premium.benefits.backgroundPlay.description',
    },
    {
      icon: <Download className="text-primary-600" size={32} />,
      titleKey: 'premium.benefits.recording.title',
      descriptionKey: 'premium.benefits.recording.description',
    },
    {
      icon: <Headphones className="text-primary-600" size={32} />,
      titleKey: 'premium.benefits.prioritySupport.title',
      descriptionKey: 'premium.benefits.prioritySupport.description',
    },
    {
      icon: <Shield className="text-primary-600" size={32} />,
      titleKey: 'premium.benefits.unlimitedListening.title',
      descriptionKey: 'premium.benefits.unlimitedListening.description',
    },
    {
      icon: <Smartphone className="text-primary-600" size={32} />,
      titleKey: 'premium.benefits.multiDevice.title',
      descriptionKey: 'premium.benefits.multiDevice.description',
    },
  ]
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {FEATURES.map((feature, index) => (
        <div
          key={index}
          className="p-6 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-3 hover:shadow-lg transition-shadow"
        >
          <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            {feature.icon}
          </div>
          <h3 className="font-semibold text-lg">{t(feature.titleKey)}</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {t(feature.descriptionKey)}
          </p>
        </div>
      ))}
    </div>
  )
}

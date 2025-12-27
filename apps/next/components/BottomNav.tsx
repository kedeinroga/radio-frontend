'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Search, Compass } from 'lucide-react'
import { useAppTranslation } from '@/hooks/useAppTranslation'

/**
 * Bottom Navigation Bar
 * Fixed navigation at the bottom with Favorites, Search, and Discover
 */
export default function BottomNav() {
  const pathname = usePathname()
  const { t } = useAppTranslation()

  const navItems = [
    {
      name: t('navigation.favorites'),
      href: '/favorites',
      icon: Heart,
      ariaLabel: t('navigation.ariaLabels.viewFavorites'),
    },
    {
      name: t('navigation.search'),
      href: '/search',
      icon: Search,
      ariaLabel: t('navigation.ariaLabels.searchStations'),
    },
    {
      name: t('navigation.discover'),
      href: '/',
      icon: Compass,
      ariaLabel: t('navigation.ariaLabels.discoverStations'),
    },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900 border-t border-gray-800 safe-area-inset-bottom"
      role="navigation"
      aria-label={t('navigation.ariaLabels.mainNav')}
    >
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg
                  transition-all duration-200 min-w-[80px]
                  ${
                    isActive
                      ? 'text-primary-500 bg-primary-500/10'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-900
                `}
                aria-label={item.ariaLabel}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`}
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

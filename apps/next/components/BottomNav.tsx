'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Search, Compass } from 'lucide-react'
import { useAppTranslation } from '@/hooks/useAppTranslation'

/**
 * Bottom Navigation — floating pill with glass morphism
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
      className="fixed bottom-0 left-0 right-0 z-40"
      role="navigation"
      aria-label={t('navigation.ariaLabels.mainNav')}
    >
      <div className="flex justify-center px-4 pb-3 pt-1">
        <div
          className="flex items-center gap-1 px-2 py-2 rounded-2xl bg-neutral-900/90 backdrop-blur-2xl border border-white/[0.08] shadow-[0_4px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]"
          style={{ minWidth: 260 }}
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname?.startsWith(item.href))
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  relative flex flex-col items-center justify-center gap-0.5
                  px-6 py-2 rounded-xl min-w-[80px]
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 focus:ring-offset-neutral-900
                  ${isActive
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/[0.05]'
                  }
                `}
                aria-label={item.ariaLabel}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active dot */}
                {isActive && (
                  <span
                    className="absolute top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500"
                    aria-hidden="true"
                  />
                )}

                <Icon
                  className={`w-5 h-5 mt-1 transition-all duration-200 ${
                    isActive ? 'fill-current scale-110' : 'scale-100'
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  aria-hidden="true"
                />
                <span className="text-[10px] font-medium tracking-wide">
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

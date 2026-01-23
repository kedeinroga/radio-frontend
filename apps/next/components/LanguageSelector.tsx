'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Locale } from '@radio-app/app'
import { useI18n } from './I18nProvider'
import { setApiLocale } from '@radio-app/app'

interface LanguageOption {
  code: string
  name: string
  flag: string
}

const LANGUAGES: LanguageOption[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
]

export function LanguageSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const { locale: currentLocale, changeLocale } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get current language display info
  const currentLanguage = LANGUAGES.find((lang) => lang.code === currentLocale.code) || LANGUAGES[0]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLanguageChange = async (langCode: string) => {
    try {
      // Create new Locale object
      const newLocale = Locale.fromString(langCode)
      
      // Change locale in the translator
      await changeLocale(newLocale)
      
      // Update API locale for future requests
      setApiLocale(newLocale)
      
      // Save preference in cookie (done by middleware on next navigation)
      document.cookie = `app-locale=${langCode}; path=/; max-age=${60 * 60 * 24 * 365}` // 1 year
      
      // Update URL to new locale
      const currentPath = pathname || '/'
      const pathSegments = currentPath.split('/').filter(Boolean)
      
      // Replace locale in path (first segment should be locale)
      if (pathSegments.length > 0 && ['es', 'en', 'fr', 'de'].includes(pathSegments[0])) {
        pathSegments[0] = langCode
      } else {
        // If no locale in path, add it
        pathSegments.unshift(langCode)
      }
      
      const newPath = `/${pathSegments.join('/')}`
      
      // Navigate to new locale path
      router.push(newPath)
      
      // Close dropdown
      setIsOpen(false)
    } catch (error) {

    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Language Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label={`Current language: ${currentLanguage.name}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-xl" role="img" aria-label={currentLanguage.name}>
          {currentLanguage.flag}
        </span>
        <span className="text-sm font-medium text-neutral-900 dark:text-white hidden sm:inline">
          {currentLanguage.name}
        </span>
        <svg
          className={`w-4 h-4 text-neutral-600 dark:text-neutral-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50"
          role="menu"
          aria-orientation="vertical"
        >
          {LANGUAGES.map((language) => {
            const isActive = language.code === currentLocale.code
            
            return (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                disabled={isActive}
                className={`
                  w-full flex items-center gap-3 px-4 py-2 text-left transition-colors
                  ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                  }
                  focus:outline-none focus:bg-neutral-50 dark:focus:bg-neutral-700
                  disabled:cursor-default
                `}
                role="menuitem"
                aria-label={`Switch to ${language.name}`}
              >
                <span className="text-xl" role="img" aria-label={language.name}>
                  {language.flag}
                </span>
                <span className="text-sm font-medium flex-1">{language.name}</span>
                {isActive && (
                  <svg
                    className="w-5 h-5 text-primary-600 dark:text-primary-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

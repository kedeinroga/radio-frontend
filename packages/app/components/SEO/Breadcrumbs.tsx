import React from 'react'
import Link from 'next/link'
import { BreadcrumbSchema } from './JsonLdSchema'

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

/**
 * Breadcrumbs Navigation Component
 * Visual breadcrumb trail with JSON-LD schema for SEO
 */
export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  if (items.length === 0) return null

  return (
    <>
      <BreadcrumbSchema items={items} />
      <nav 
        aria-label="Breadcrumb" 
        className={`text-sm mb-4 ${className}`}
      >
        <ol className="flex items-center space-x-2 flex-wrap">
          {items.map((item, index) => (
            <li key={item.url} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400" aria-hidden="true">
                  /
                </span>
              )}
              {index === items.length - 1 ? (
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  {item.name}
                </span>
              ) : (
                <Link 
                  href={item.url} 
                  className="text-blue-600 dark:text-blue-400 hover:underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

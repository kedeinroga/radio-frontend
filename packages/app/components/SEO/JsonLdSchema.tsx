import React from 'react'
import { Station } from '../../domain/entities/Station'

interface RadioStationSchemaProps {
  station: Station
  baseUrl: string
}

/**
 * Radio Station JSON-LD Schema Component
 * Implements schema.org/RadioStation for rich search results
 */
export function RadioStationSchema({ station, baseUrl }: RadioStationSchemaProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RadioStation",
    "name": station.name,
    "url": station.getCanonicalUrl(baseUrl),
    "image": station.seoMetadata?.imageUrl || station.imageUrl,
    "genre": station.tags,
    "address": station.country ? {
      "@type": "PostalAddress",
      "addressCountry": station.country
    } : undefined,
    "alternateName": station.seoMetadata?.alternateNames || [],
    "dateModified": station.seoMetadata?.lastModified,
    "broadcastFrequency": station.bitrate ? `${station.bitrate}kbps` : undefined
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[]
}

/**
 * Breadcrumb List JSON-LD Schema Component
 * Implements schema.org/BreadcrumbList for navigation hierarchy
 */
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface WebSiteSchemaProps {
  name: string
  url: string
  description: string
  searchActionTarget?: string
}

/**
 * WebSite JSON-LD Schema Component
 * Implements schema.org/WebSite for site-wide search
 */
export function WebSiteSchema({ name, url, description, searchActionTarget }: WebSiteSchemaProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name,
    "url": url,
    "description": description,
    "potentialAction": searchActionTarget ? {
      "@type": "SearchAction",
      "target": searchActionTarget,
      "query-input": "required name=search_term_string"
    } : undefined
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

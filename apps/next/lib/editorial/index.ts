import type { EditorialHub, GenreHub, CountryHub } from './types'
import { GENRE_HUBS } from './genres'
import { COUNTRY_HUBS } from './countries'

export type { EditorialHub, GenreHub, CountryHub } from './types'
export { GENRE_HUBS, COUNTRY_HUBS }

/** El contenido editorial está en español: solo /es se indexa, y solo si se revisó. */
export const EDITORIAL_LOCALE = 'es'

export function getGenreHub(slug: string): GenreHub | undefined {
  const normalized = decodeURIComponent(slug).toLowerCase()
  return GENRE_HUBS.find((hub) => hub.slug === normalized)
}

export function getCountryHub(code: string): CountryHub | undefined {
  const normalized = decodeURIComponent(code).toUpperCase()
  return COUNTRY_HUBS.find((hub) => hub.slug === normalized)
}

export function isHubIndexable(hub: EditorialHub | undefined, locale: string): hub is EditorialHub {
  return !!hub && hub.reviewed && locale === EDITORIAL_LOCALE
}

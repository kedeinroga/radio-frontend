/**
 * Contenido editorial propio de las páginas hub (/genre/[tag] y /country/[code]).
 *
 * El texto está en español (como el blog). Una página hub solo se indexa en /es y solo cuando
 * `reviewed` es true: el texto lo revisa una persona antes de exponerlo a Google/AdSense.
 */
export interface HubSection {
  heading: string
  /** Párrafos separados por línea en blanco. */
  body: string
}

export interface HubFAQ {
  q: string
  a: string
}

export interface HubLink {
  label: string
  href: string // sin locale, p.ej. "/blog/mejores-radios-de-jazz-online"
}

export interface EditorialHub {
  /** Segmento de URL: slug del género ("clasica") o código ISO del país ("PE"). */
  slug: string
  /** Nombre visible por locale (las tarjetas de navegación existen en los 4 idiomas). */
  names: Record<'es' | 'en' | 'fr' | 'de', string>
  emoji: string
  /** Título SEO (sin el sufijo de marca, que añade el layout). */
  metaTitle: string
  metaDescription: string
  h1: string
  /** Párrafos que van antes del listado de emisoras. */
  intro: string[]
  /** Secciones que van después del listado. */
  sections: HubSection[]
  faq: HubFAQ[]
  related: HubLink[]
  updatedAt: string // ISO date
  reviewed: boolean
}

export interface GenreHub extends EditorialHub {
  /**
   * Tag(s) de Radio Browser con que se buscan las emisoras (coincidencia parcial). Una lista
   * cuando el tag genérico está mal usado (p.ej. "classical" en emisoras que no lo son).
   */
  tag: string | string[]
}

export type CountryHub = EditorialHub

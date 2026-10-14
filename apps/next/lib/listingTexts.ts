/**
 * Textos visibles de los listados por género y por país (/genre/[tag], /country/[code]).
 * Server-only: estas páginas son Server Components y no pasan por I18nProvider.
 */
export interface ListingTexts {
  home: string
  genres: string
  countries: string
  genreHeading: (name: string) => string
  countryHeading: (name: string) => string
  stationCount: (count: number) => string
  noStations: string
  searchOther: string
}

const TEXTS: Record<string, ListingTexts> = {
  es: {
    home: 'Inicio',
    genres: 'Géneros',
    countries: 'Países',
    genreHeading: (name) => `Radios de ${name}`,
    countryHeading: (name) => `Radios de ${name}`,
    stationCount: (count) => `${count} emisoras disponibles`,
    noStations: 'No encontramos emisoras disponibles en este momento.',
    searchOther: 'Buscar otras emisoras →',
  },
  en: {
    home: 'Home',
    genres: 'Genres',
    countries: 'Countries',
    genreHeading: (name) => `${name} radio stations`,
    countryHeading: (name) => `Radio stations from ${name}`,
    stationCount: (count) => `${count} stations available`,
    noStations: 'No stations are available right now.',
    searchOther: 'Search other stations →',
  },
  fr: {
    home: 'Accueil',
    genres: 'Genres',
    countries: 'Pays',
    genreHeading: (name) => `Radios ${name}`,
    countryHeading: (name) => `Radios — ${name}`,
    stationCount: (count) => `${count} stations disponibles`,
    noStations: 'Aucune station disponible pour le moment.',
    searchOther: 'Rechercher d’autres stations →',
  },
  de: {
    home: 'Startseite',
    genres: 'Genres',
    countries: 'Länder',
    genreHeading: (name) => `${name}-Radiosender`,
    countryHeading: (name) => `Radiosender aus ${name}`,
    stationCount: (count) => `${count} Sender verfügbar`,
    noStations: 'Derzeit sind keine Sender verfügbar.',
    searchOther: 'Andere Sender suchen →',
  },
}

export function getListingTexts(locale: string): ListingTexts {
  return TEXTS[locale] ?? TEXTS.es
}

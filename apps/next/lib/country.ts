/**
 * Nombre de país para mostrar en la UI.
 *
 * Las emisoras traen el código ISO 3166-1 alpha-2 en `country` (ver StationDTO), que se
 * traduce con Intl.DisplayNames al locale activo: "US" -> "Estados Unidos" / "United States".
 * Los favoritos guardados antes del cambio conservan el nombre crudo de Radio Browser
 * ("The United States Of America") y se muestran tal cual. Sirve en servidor y cliente.
 */
const displayNamesCache = new Map<string, Intl.DisplayNames | null>()

function getDisplayNames(locale: string): Intl.DisplayNames | null {
  if (!displayNamesCache.has(locale)) {
    try {
      displayNamesCache.set(locale, new Intl.DisplayNames([locale], { type: 'region' }))
    } catch {
      displayNamesCache.set(locale, null)
    }
  }
  return displayNamesCache.get(locale) ?? null
}

export function formatCountry(country: string | undefined, locale: string): string | undefined {
  const value = country?.trim()
  if (!value) return undefined
  if (!/^[A-Z]{2}$/i.test(value)) return value

  const code = value.toUpperCase()
  try {
    return getDisplayNames(locale)?.of(code) ?? code
  } catch {
    return code
  }
}

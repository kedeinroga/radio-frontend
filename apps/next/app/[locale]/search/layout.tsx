import type { Metadata } from 'next'

// Página de utilidad sin contenido propio para un bot (resultados vacíos / favoritos en
// localStorage): fuera del índice.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}

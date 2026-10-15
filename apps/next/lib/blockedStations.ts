/**
 * Emisoras retiradas del directorio a petición de sus titulares o por motivos legales
 * (ver /copyright). Se ocultan de listados, búsqueda, hubs y fichas (la ficha da 404).
 *
 * Para retirar una emisora:
 * 1. Copia su id de la URL de la ficha: /es/radio/<id>
 * 2. Añade una entrada con ese id, su nombre tal como aparece y el motivo
 * 3. Commit + deploy
 *
 * El nombre bloquea también sus variantes (otros ids de la misma emisora en Radio Browser,
 * p.ej. "Radio X HD" y "Radio X (128k AAC)"), que de otro modo ocuparían su lugar.
 */
export interface BlockedStation {
  id: string
  name: string
  /** Fecha de la retirada (YYYY-MM-DD) */
  date: string
  reason: string
}

export const BLOCKED_STATIONS: BlockedStation[] = [
  // { id: '00000000-0000-0000-0000-000000000000', name: 'Radio Ejemplo', date: '2026-10-15', reason: 'Solicitud del titular' },
]

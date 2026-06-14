/**
 * StationTrack
 *
 * Representa una canción detectada sonando en una estación ("sonando ahora" /
 * "sonó recientemente"), capturada del metadata ICY de los streams por el backend.
 *
 * Es un DTO plano (no una clase) para poder pasarse de Server a Client Components
 * sin problemas de serialización.
 */
export interface StationTrack {
  stationId: string
  rawTitle: string
  artist?: string
  title: string
  /** ISO 8601 timestamp de cuándo se detectó la pista sonando. */
  playedAt: string
}

/**
 * Mapea la respuesta del backend (snake_case) a StationTrack (camelCase).
 */
export function mapToStationTrack(data: {
  station_id: string
  raw_title: string
  artist?: string
  title: string
  played_at: string
}): StationTrack {
  return {
    stationId: data.station_id,
    rawTitle: data.raw_title,
    artist: data.artist || undefined,
    title: data.title,
    playedAt: data.played_at,
  }
}

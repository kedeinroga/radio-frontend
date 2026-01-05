/**
 * Session Management Entities
 * Entities for JWT session management
 */

export interface DeviceInfo {
  browser: string
  os: string
  device_type: string
  user_agent: string
}

export interface Location {
  ip: string
  country: string
  city: string
}

export interface SessionInfo {
  session_id: string
  token_id: string
  device_info: DeviceInfo
  location: Location
  created_at: string
  last_activity: string
  expires_at: string
  is_current: boolean
}

export interface GetSessionsResponse {
  sessions: SessionInfo[]
  total_sessions: number
}

export interface RevokeTokenRequest {
  token_id?: string
  session_id?: string
  revoke_all?: boolean
}

export interface RevokeTokenResponse {
  message: string
  revoked_count: number
}

export interface SessionMetadata {
  user_agent: string
  ip_address: string
  browser: string
  os: string
  device_type: string
  country: string
  city: string
  last_activity: string
}

export interface ValidateTokenRequest {
  include_metadata?: boolean
}

export interface ValidateTokenResponse {
  valid: boolean
  user_id: string
  email: string
  role: string
  token_id: string
  issued_at: string
  expires_at: string
  session_metadata?: SessionMetadata
}

export interface LogoutResponse {
  success: boolean
  message: string
  token_id: string
  blacklisted_at: string
}

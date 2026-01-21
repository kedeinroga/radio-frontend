/**
 * Audio Ad Entity
 * 
 * Representa un anuncio de audio que se reproduce durante la experiencia de radio.
 * Soporta formatos VAST/VMAP para anuncios programáticos.
 */

/**
 * Audio Ad Placement Types
 */
export type AudioAdPlacement = 
  | 'pre_roll'    // Before content starts
  | 'mid_roll'    // During content (at specific time)
  | 'post_roll'   // After content ends
  | 'station_break' // Between station changes

/**
 * Audio Ad Format
 */
export type AudioAdFormat = 
  | 'audio'       // Pure audio ad
  | 'video_audio' // Video ad (audio only)
  | 'companion'   // Audio + companion banner

/**
 * VAST/VMAP Integration
 */
export interface VASTResponse {
  version: string
  ads: VASTAd[]
}

export interface VASTAd {
  id: string
  sequence?: number
  inline?: VASTInLine
  wrapper?: VASTWrapper
}

export interface VASTInLine {
  adSystem: string
  adTitle: string
  description?: string
  advertiser?: string
  pricing?: string
  error?: string
  impression: string[]
  creatives: VASTCreative[]
  extensions?: Record<string, any>
}

export interface VASTWrapper {
  adSystem: string
  vastAdTagURI: string
  error?: string
  impression: string[]
  creatives: VASTCreative[]
}

export interface VASTCreative {
  id: string
  sequence?: number
  adId?: string
  linear?: VASTLinear
  nonLinear?: VASTNonLinear
  companionAds?: VASTCompanionAd[]
}

export interface VASTLinear {
  duration: number // seconds
  skipOffset?: number // seconds (e.g., 5 for "skip after 5s")
  trackingEvents: VASTTrackingEvent[]
  videoClicks?: VASTVideoClicks
  mediaFiles: VASTMediaFile[]
  icons?: VASTIcon[]
}

export interface VASTNonLinear {
  width: number
  height: number
  minSuggestedDuration?: number
  trackingEvents: VASTTrackingEvent[]
  staticResource?: string
  iframeResource?: string
  htmlResource?: string
}

export interface VASTCompanionAd {
  id: string
  width: number
  height: number
  assetWidth?: number
  assetHeight?: number
  expandedWidth?: number
  expandedHeight?: number
  staticResource?: string
  iframeResource?: string
  htmlResource?: string
  trackingEvents: VASTTrackingEvent[]
  companionClickThrough?: string
}

export interface VASTTrackingEvent {
  event: VASTTrackingEventType
  uri: string
}

export type VASTTrackingEventType = 
  | 'start'
  | 'firstQuartile'
  | 'midpoint'
  | 'thirdQuartile'
  | 'complete'
  | 'mute'
  | 'unmute'
  | 'pause'
  | 'resume'
  | 'rewind'
  | 'skip'
  | 'progress'
  | 'close'
  | 'acceptInvitation'
  | 'collapse'
  | 'expand'
  | 'error'

export interface VASTVideoClicks {
  clickThrough?: string
  clickTracking?: string[]
  customClick?: string[]
}

export interface VASTMediaFile {
  id?: string
  delivery: 'progressive' | 'streaming'
  type: string // MIME type (e.g., 'audio/mpeg', 'audio/mp4')
  bitrate?: number // kbps
  width?: number
  height?: number
  scalable?: boolean
  maintainAspectRatio?: boolean
  url: string
}

export interface VASTIcon {
  program: string
  width: number
  height: number
  xPosition: string
  yPosition: string
  duration?: number
  offset?: number
  staticResource?: string
  iframeResource?: string
  htmlResource?: string
  iconClicks?: VASTVideoClicks
  iconViewTracking?: string[]
}

/**
 * Audio Ad Entity
 */
export interface AudioAd {
  id: string
  campaignId: string
  
  // Basic Info
  title: string
  description?: string
  advertiser: string
  
  // Audio Details
  audioUrl: string
  duration: number // seconds
  format: AudioAdFormat
  mimeType: string // e.g., 'audio/mpeg', 'audio/mp4'
  bitrate?: number // kbps
  
  // Placement
  placement: AudioAdPlacement
  skipAfter?: number // seconds before skip button appears (e.g., 5)
  
  // VAST Integration
  vastTagUrl?: string // URL to fetch VAST XML
  vastResponse?: VASTResponse // Parsed VAST response
  
  // Companion Display
  companionBannerUrl?: string
  companionClickUrl?: string
  companionWidth?: number
  companionHeight?: number
  
  // Tracking URLs
  impressionUrl: string
  clickUrl?: string
  startUrl?: string
  firstQuartileUrl?: string
  midpointUrl?: string
  thirdQuartileUrl?: string
  completeUrl?: string
  skipUrl?: string
  muteUrl?: string
  unmuteUrl?: string
  pauseUrl?: string
  resumeUrl?: string
  errorUrl?: string
  
  // Targeting
  targetCountries?: string[]
  targetGenres?: string[]
  targetStations?: string[]
  
  // Frequency
  maxImpressions?: number
  currentImpressions: number
  maxImpressionsPerUser?: number
  
  // Status
  isActive: boolean
  startDate: Date
  endDate?: Date
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

/**
 * Audio Ad Playback State
 */
export interface AudioAdPlaybackState {
  adId: string
  placement: AudioAdPlacement
  status: 'loading' | 'ready' | 'playing' | 'paused' | 'completed' | 'skipped' | 'error'
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  canSkip: boolean
  skipIn?: number // seconds until skip available
  error?: string
}

/**
 * Audio Ad Queue
 */
export interface AudioAdQueue {
  preRoll: AudioAd[]
  midRoll: AudioAdMidRoll[]
  postRoll: AudioAd[]
  stationBreak: AudioAd[]
}

export interface AudioAdMidRoll {
  ad: AudioAd
  playAt: number // seconds into content
}

/**
 * Audio Ad Config
 */
export interface AudioAdConfig {
  enabled: boolean
  placement: AudioAdPlacement[]
  maxPreRoll: number
  maxMidRoll: number
  maxPostRoll: number
  minMidRollInterval: number // seconds between mid-rolls
  allowSkip: boolean
  skipDelay: number // seconds before skip available
  volume: number // 0-1
  respectUserVolume: boolean
}

/**
 * Helper: Create AudioAd from VAST response
 */
export function createAudioAdFromVAST(
  vastResponse: VASTResponse,
  placement: AudioAdPlacement,
  campaignId: string
): AudioAd | null {
  const ad = vastResponse.ads[0]
  if (!ad?.inline) return null
  
  const inline = ad.inline
  const creative = inline.creatives.find(c => c.linear)
  if (!creative?.linear) return null
  
  const linear = creative.linear
  const mediaFile = linear.mediaFiles.find(m => m.type.startsWith('audio/'))
  if (!mediaFile) return null
  
  // Extract tracking URLs
  const getTrackingUrl = (event: VASTTrackingEventType): string | undefined => {
    return linear.trackingEvents.find(e => e.event === event)?.uri
  }
  
  const audioAd: AudioAd = {
    id: ad.id,
    campaignId,
    title: inline.adTitle,
    description: inline.description,
    advertiser: inline.advertiser || inline.adSystem,
    audioUrl: mediaFile.url,
    duration: linear.duration,
    format: 'audio',
    mimeType: mediaFile.type,
    bitrate: mediaFile.bitrate,
    placement,
    skipAfter: linear.skipOffset,
    vastResponse,
    impressionUrl: inline.impression[0] || '',
    clickUrl: linear.videoClicks?.clickThrough,
    startUrl: getTrackingUrl('start'),
    firstQuartileUrl: getTrackingUrl('firstQuartile'),
    midpointUrl: getTrackingUrl('midpoint'),
    thirdQuartileUrl: getTrackingUrl('thirdQuartile'),
    completeUrl: getTrackingUrl('complete'),
    skipUrl: getTrackingUrl('skip'),
    muteUrl: getTrackingUrl('mute'),
    unmuteUrl: getTrackingUrl('unmute'),
    pauseUrl: getTrackingUrl('pause'),
    resumeUrl: getTrackingUrl('resume'),
    errorUrl: getTrackingUrl('error'),
    currentImpressions: 0,
    isActive: true,
    startDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  
  // Add companion ad if available
  const companionCreative = inline.creatives.find(c => c.companionAds)
  if (companionCreative?.companionAds?.[0]) {
    const companion = companionCreative.companionAds[0]
    audioAd.companionBannerUrl = companion.staticResource || companion.iframeResource
    audioAd.companionClickUrl = companion.companionClickThrough
    audioAd.companionWidth = companion.width
    audioAd.companionHeight = companion.height
  }
  
  return audioAd
}

/**
 * Helper: Check if ad should play
 */
export function shouldPlayAudioAd(
  ad: AudioAd,
  userImpressions: number,
  userCountry?: string,
  stationGenre?: string,
  stationId?: string
): boolean {
  // Check if active
  if (!ad.isActive) return false
  
  // Check date range
  const now = new Date()
  if (ad.startDate > now) return false
  if (ad.endDate && ad.endDate < now) return false
  
  // Check max impressions
  if (ad.maxImpressions && ad.currentImpressions >= ad.maxImpressions) return false
  if (ad.maxImpressionsPerUser && userImpressions >= ad.maxImpressionsPerUser) return false
  
  // Check targeting
  if (ad.targetCountries?.length && userCountry && !ad.targetCountries.includes(userCountry)) {
    return false
  }
  
  if (ad.targetGenres?.length && stationGenre && !ad.targetGenres.includes(stationGenre)) {
    return false
  }
  
  if (ad.targetStations?.length && stationId && !ad.targetStations.includes(stationId)) {
    return false
  }
  
  return true
}

/**
 * Helper: Calculate ad progress
 */
export function calculateAdProgress(currentTime: number, duration: number): {
  percentage: number
  quartile: 'start' | 'first' | 'mid' | 'third' | 'complete'
} {
  const percentage = (currentTime / duration) * 100
  
  let quartile: 'start' | 'first' | 'mid' | 'third' | 'complete' = 'start'
  if (percentage >= 100) quartile = 'complete'
  else if (percentage >= 75) quartile = 'third'
  else if (percentage >= 50) quartile = 'mid'
  else if (percentage >= 25) quartile = 'first'
  
  return { percentage, quartile }
}

/**
 * Helper: Format duration for display
 */
export function formatAdDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Helper: Create ad queue
 */
export function createAudioAdQueue(
  ads: AudioAd[],
  contentDuration?: number
): AudioAdQueue {
  const queue: AudioAdQueue = {
    preRoll: [],
    midRoll: [],
    postRoll: [],
    stationBreak: [],
  }
  
  ads.forEach(ad => {
    switch (ad.placement) {
      case 'pre_roll':
        queue.preRoll.push(ad)
        break
      case 'post_roll':
        queue.postRoll.push(ad)
        break
      case 'station_break':
        queue.stationBreak.push(ad)
        break
      case 'mid_roll':
        // Place at random time if content duration known
        if (contentDuration) {
          const playAt = Math.random() * contentDuration * 0.8 + contentDuration * 0.1
          queue.midRoll.push({ ad, playAt })
        }
        break
    }
  })
  
  // Sort mid-rolls by time
  queue.midRoll.sort((a, b) => a.playAt - b.playAt)
  
  return queue
}

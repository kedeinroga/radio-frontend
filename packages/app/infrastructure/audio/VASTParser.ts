/**
 * VAST/VMAP Parser
 * 
 * Parsea respuestas XML de VAST (Video Ad Serving Template) y VMAP (Video Multiple Ad Playlist)
 * para anuncios de audio programáticos.
 */

import type {
  VASTResponse,
  VASTAd,
  VASTInLine,
  VASTWrapper,
  VASTCreative,
  VASTLinear,
  VASTNonLinear,
  VASTCompanionAd,
  VASTTrackingEvent,
  VASTVideoClicks,
  VASTMediaFile,
  VASTTrackingEventType,
} from '../../domain/entities/AudioAd'

/**
 * Parse VAST XML response
 */
export async function parseVASTResponse(xml: string): Promise<VASTResponse | null> {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/xml')
    
    // Check for parse errors
    const parserError = doc.querySelector('parsererror')
    if (parserError) {
      console.error('VAST XML parse error:', parserError.textContent)
      return null
    }
    
    const vast = doc.querySelector('VAST')
    if (!vast) return null
    
    const version = vast.getAttribute('version') || '2.0'
    const ads = parseAds(vast)
    
    return {
      version,
      ads,
    }
  } catch (error) {
    console.error('Error parsing VAST:', error)
    return null
  }
}

/**
 * Parse Ads
 */
function parseAds(vast: Element): VASTAd[] {
  const adElements = vast.querySelectorAll('Ad')
  const ads: VASTAd[] = []
  
  adElements.forEach(adEl => {
    const id = adEl.getAttribute('id') || ''
    const sequence = adEl.getAttribute('sequence')
    
    const inlineEl = adEl.querySelector('InLine')
    const wrapperEl = adEl.querySelector('Wrapper')
    
    const ad: VASTAd = { id }
    
    if (sequence) {
      ad.sequence = parseInt(sequence, 10)
    }
    
    if (inlineEl) {
      ad.inline = parseInLine(inlineEl)
    }
    
    if (wrapperEl) {
      ad.wrapper = parseWrapper(wrapperEl)
    }
    
    ads.push(ad)
  })
  
  return ads
}

/**
 * Parse InLine
 */
function parseInLine(inlineEl: Element): VASTInLine {
  const adSystem = getTextContent(inlineEl, 'AdSystem')
  const adTitle = getTextContent(inlineEl, 'AdTitle')
  const description = getTextContent(inlineEl, 'Description')
  const advertiser = getTextContent(inlineEl, 'Advertiser')
  const pricing = getTextContent(inlineEl, 'Pricing')
  const error = getTextContent(inlineEl, 'Error')
  
  const impression = getTextContents(inlineEl, 'Impression')
  const creatives = parseCreatives(inlineEl)
  
  return {
    adSystem,
    adTitle,
    description,
    advertiser,
    pricing,
    error,
    impression,
    creatives,
  }
}

/**
 * Parse Wrapper
 */
function parseWrapper(wrapperEl: Element): VASTWrapper {
  const adSystem = getTextContent(wrapperEl, 'AdSystem')
  const vastAdTagURI = getTextContent(wrapperEl, 'VASTAdTagURI')
  const error = getTextContent(wrapperEl, 'Error')
  const impression = getTextContents(wrapperEl, 'Impression')
  const creatives = parseCreatives(wrapperEl)
  
  return {
    adSystem,
    vastAdTagURI,
    error,
    impression,
    creatives,
  }
}

/**
 * Parse Creatives
 */
function parseCreatives(parent: Element): VASTCreative[] {
  const creativesEl = parent.querySelector('Creatives')
  if (!creativesEl) return []
  
  const creativeElements = creativesEl.querySelectorAll('Creative')
  const creatives: VASTCreative[] = []
  
  creativeElements.forEach(creativeEl => {
    const id = creativeEl.getAttribute('id') || ''
    const sequence = creativeEl.getAttribute('sequence')
    const adId = creativeEl.getAttribute('adId') || undefined
    
    const linearEl = creativeEl.querySelector('Linear')
    const nonLinearAdsEl = creativeEl.querySelector('NonLinearAds')
    const companionAdsEl = creativeEl.querySelector('CompanionAds')
    
    const creative: VASTCreative = { id }
    
    if (sequence) {
      creative.sequence = parseInt(sequence, 10)
    }
    
    if (adId) {
      creative.adId = adId
    }
    
    if (linearEl) {
      creative.linear = parseLinear(linearEl)
    }
    
    if (nonLinearAdsEl) {
      const nonLinearEl = nonLinearAdsEl.querySelector('NonLinear')
      if (nonLinearEl) {
        creative.nonLinear = parseNonLinear(nonLinearEl)
      }
    }
    
    if (companionAdsEl) {
      creative.companionAds = parseCompanionAds(companionAdsEl)
    }
    
    creatives.push(creative)
  })
  
  return creatives
}

/**
 * Parse Linear
 */
function parseLinear(linearEl: Element): VASTLinear {
  const duration = parseDuration(getTextContent(linearEl, 'Duration'))
  const skipOffset = linearEl.getAttribute('skipoffset')
  
  const trackingEvents = parseTrackingEvents(linearEl)
  const mediaFiles = parseMediaFiles(linearEl)
  
  const videoClicksEl = linearEl.querySelector('VideoClicks')
  const videoClicks = videoClicksEl ? parseVideoClicks(videoClicksEl) : undefined
  
  const linear: VASTLinear = {
    duration,
    trackingEvents,
    mediaFiles,
  }
  
  if (skipOffset) {
    linear.skipOffset = parseTimeOffset(skipOffset)
  }
  
  if (videoClicks) {
    linear.videoClicks = videoClicks
  }
  
  return linear
}

/**
 * Parse NonLinear
 */
function parseNonLinear(nonLinearEl: Element): VASTNonLinear {
  const width = parseInt(nonLinearEl.getAttribute('width') || '0', 10)
  const height = parseInt(nonLinearEl.getAttribute('height') || '0', 10)
  const minSuggestedDuration = nonLinearEl.getAttribute('minSuggestedDuration')
  
  const trackingEvents = parseTrackingEvents(nonLinearEl)
  const staticResource = getTextContent(nonLinearEl, 'StaticResource')
  const iframeResource = getTextContent(nonLinearEl, 'IFrameResource')
  const htmlResource = getTextContent(nonLinearEl, 'HTMLResource')
  
  return {
    width,
    height,
    minSuggestedDuration: minSuggestedDuration ? parseDuration(minSuggestedDuration) : undefined,
    trackingEvents,
    staticResource,
    iframeResource,
    htmlResource,
  }
}

/**
 * Parse CompanionAds
 */
function parseCompanionAds(companionAdsEl: Element): VASTCompanionAd[] {
  const companionElements = companionAdsEl.querySelectorAll('Companion')
  const companions: VASTCompanionAd[] = []
  
  companionElements.forEach(companionEl => {
    const id = companionEl.getAttribute('id') || ''
    const width = parseInt(companionEl.getAttribute('width') || '0', 10)
    const height = parseInt(companionEl.getAttribute('height') || '0', 10)
    
    const trackingEvents = parseTrackingEvents(companionEl)
    const staticResource = getTextContent(companionEl, 'StaticResource')
    const iframeResource = getTextContent(companionEl, 'IFrameResource')
    const htmlResource = getTextContent(companionEl, 'HTMLResource')
    const companionClickThrough = getTextContent(companionEl, 'CompanionClickThrough')
    
    companions.push({
      id,
      width,
      height,
      trackingEvents,
      staticResource,
      iframeResource,
      htmlResource,
      companionClickThrough,
    })
  })
  
  return companions
}

/**
 * Parse TrackingEvents
 */
function parseTrackingEvents(parent: Element): VASTTrackingEvent[] {
  const trackingEl = parent.querySelector('TrackingEvents')
  if (!trackingEl) return []
  
  const trackingElements = trackingEl.querySelectorAll('Tracking')
  const events: VASTTrackingEvent[] = []
  
  trackingElements.forEach(trackingElement => {
    const event = trackingElement.getAttribute('event') as VASTTrackingEventType
    const uri = trackingElement.textContent?.trim() || ''
    
    if (event && uri) {
      events.push({ event, uri })
    }
  })
  
  return events
}

/**
 * Parse VideoClicks
 */
function parseVideoClicks(videoClicksEl: Element): VASTVideoClicks {
  const clickThrough = getTextContent(videoClicksEl, 'ClickThrough')
  const clickTracking = getTextContents(videoClicksEl, 'ClickTracking')
  const customClick = getTextContents(videoClicksEl, 'CustomClick')
  
  return {
    clickThrough,
    clickTracking,
    customClick,
  }
}

/**
 * Parse MediaFiles
 */
function parseMediaFiles(linearEl: Element): VASTMediaFile[] {
  const mediaFilesEl = linearEl.querySelector('MediaFiles')
  if (!mediaFilesEl) return []
  
  const mediaFileElements = mediaFilesEl.querySelectorAll('MediaFile')
  const mediaFiles: VASTMediaFile[] = []
  
  mediaFileElements.forEach(mediaFileEl => {
    const id = mediaFileEl.getAttribute('id') || undefined
    const delivery = mediaFileEl.getAttribute('delivery') as 'progressive' | 'streaming'
    const type = mediaFileEl.getAttribute('type') || ''
    const bitrate = mediaFileEl.getAttribute('bitrate')
    const width = mediaFileEl.getAttribute('width')
    const height = mediaFileEl.getAttribute('height')
    const scalable = mediaFileEl.getAttribute('scalable')
    const maintainAspectRatio = mediaFileEl.getAttribute('maintainAspectRatio')
    const url = mediaFileEl.textContent?.trim() || ''
    
    if (url) {
      mediaFiles.push({
        id,
        delivery,
        type,
        bitrate: bitrate ? parseInt(bitrate, 10) : undefined,
        width: width ? parseInt(width, 10) : undefined,
        height: height ? parseInt(height, 10) : undefined,
        scalable: scalable === 'true',
        maintainAspectRatio: maintainAspectRatio === 'true',
        url,
      })
    }
  })
  
  return mediaFiles
}

/**
 * Parse Duration (HH:MM:SS format)
 */
function parseDuration(duration: string): number {
  const parts = duration.split(':')
  if (parts.length !== 3) return 0
  
  const hours = parseInt(parts[0], 10)
  const minutes = parseInt(parts[1], 10)
  const seconds = parseFloat(parts[2])
  
  return hours * 3600 + minutes * 60 + seconds
}

/**
 * Parse Time Offset (can be HH:MM:SS, percentage, or seconds)
 */
function parseTimeOffset(offset: string): number {
  if (offset.includes('%')) {
    return parseFloat(offset) / 100
  }
  
  if (offset.includes(':')) {
    return parseDuration(offset)
  }
  
  return parseFloat(offset)
}

/**
 * Get text content of first matching element
 */
function getTextContent(parent: Element, selector: string): string {
  const element = parent.querySelector(selector)
  return element?.textContent?.trim() || ''
}

/**
 * Get text contents of all matching elements
 */
function getTextContents(parent: Element, selector: string): string[] {
  const elements = parent.querySelectorAll(selector)
  const contents: string[] = []
  
  elements.forEach(element => {
    const text = element.textContent?.trim()
    if (text) contents.push(text)
  })
  
  return contents
}

/**
 * Fetch and parse VAST from URL
 */
export async function fetchVAST(vastUrl: string): Promise<VASTResponse | null> {
  try {
    const response = await fetch(vastUrl)
    if (!response.ok) {
      console.error('Failed to fetch VAST:', response.statusText)
      return null
    }
    
    const xml = await response.text()
    return parseVASTResponse(xml)
  } catch (error) {
    console.error('Error fetching VAST:', error)
    return null
  }
}

/**
 * Follow VAST wrappers (recursive)
 */
export async function resolveVASTWrappers(
  vastResponse: VASTResponse,
  maxDepth = 5
): Promise<VASTResponse> {
  if (maxDepth <= 0) return vastResponse
  
  const resolvedAds: VASTAd[] = []
  
  for (const ad of vastResponse.ads) {
    if (ad.wrapper) {
      // Fetch wrapped VAST
      const wrappedResponse = await fetchVAST(ad.wrapper.vastAdTagURI)
      if (wrappedResponse) {
        // Recursively resolve
        const resolved = await resolveVASTWrappers(wrappedResponse, maxDepth - 1)
        resolvedAds.push(...resolved.ads)
      }
    } else {
      resolvedAds.push(ad)
    }
  }
  
  return {
    ...vastResponse,
    ads: resolvedAds,
  }
}

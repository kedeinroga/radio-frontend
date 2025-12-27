/**
 * Station Entity Tests
 * Tests for the Station domain entity
 */

import { describe, it, expect } from 'vitest'
import { Station, SEOMetadata } from '@/domain/entities/Station'

describe('Station Entity', () => {
  const validStationData = {
    id: '123',
    name: 'Test Radio',
    streamUrl: 'https://stream.example.com/radio',
    slug: 'test-radio',
    tags: ['rock', 'classic', 'music'],
    imageUrl: 'https://example.com/image.jpg',
    country: 'Spain',
    genre: 'Rock',
    isPremium: false,
    description: 'A great radio station',
    bitrate: 128,
    votes: 1000
  }

  describe('Creation and Validation', () => {
    it('should create a valid station', () => {
      const station = new Station(
        validStationData.id,
        validStationData.name,
        validStationData.streamUrl,
        validStationData.slug,
        validStationData.tags,
        undefined,
        validStationData.imageUrl,
        validStationData.country,
        validStationData.genre,
        validStationData.isPremium,
        validStationData.description,
        validStationData.bitrate,
        validStationData.votes
      )

      expect(station.id).toBe('123')
      expect(station.name).toBe('Test Radio')
      expect(station.streamUrl).toBe('https://stream.example.com/radio')
      expect(station.slug).toBe('test-radio')
    })

    it('should throw error for empty ID', () => {
      expect(() => new Station(
        '',
        validStationData.name,
        validStationData.streamUrl,
        validStationData.slug
      )).toThrow('Station ID is required')
    })

    it('should throw error for empty name', () => {
      expect(() => new Station(
        validStationData.id,
        '',
        validStationData.streamUrl,
        validStationData.slug
      )).toThrow('Station name is required')
    })

    it('should throw error for invalid stream URL', () => {
      expect(() => new Station(
        validStationData.id,
        validStationData.name,
        'not-a-url',
        validStationData.slug
      )).toThrow('Invalid stream URL')
    })

    it('should accept http URLs', () => {
      const station = new Station(
        validStationData.id,
        validStationData.name,
        'http://stream.example.com/radio',
        validStationData.slug
      )
      expect(station.streamUrl).toBe('http://stream.example.com/radio')
    })

    it('should accept https URLs', () => {
      const station = new Station(
        validStationData.id,
        validStationData.name,
        'https://stream.example.com/radio',
        validStationData.slug
      )
      expect(station.streamUrl).toBe('https://stream.example.com/radio')
    })

    it('should create station with minimal required fields', () => {
      const station = new Station(
        validStationData.id,
        validStationData.name,
        validStationData.streamUrl,
        validStationData.slug
      )
      
      expect(station.id).toBe('123')
      expect(station.tags).toEqual([])
      expect(station.isPremium).toBe(false)
    })
  })

  describe('Display Properties', () => {
    it('should return display name', () => {
      const station = new Station(
        validStationData.id,
        'Test Radio',
        validStationData.streamUrl,
        validStationData.slug
      )
      expect(station.displayName).toBe('Test Radio')
    })

    it('should format metadata with genre and country', () => {
      const station = new Station(
        validStationData.id,
        validStationData.name,
        validStationData.streamUrl,
        validStationData.slug,
        [],
        undefined,
        undefined,
        'Spain',
        'Rock'
      )
      expect(station.metadata).toBe('Rock • Spain')
    })

    it('should format metadata with only genre', () => {
      const station = new Station(
        validStationData.id,
        validStationData.name,
        validStationData.streamUrl,
        validStationData.slug,
        [],
        undefined,
        undefined,
        undefined,
        'Rock'
      )
      expect(station.metadata).toBe('Rock')
    })

    it('should format metadata with only country', () => {
      const station = new Station(
        validStationData.id,
        validStationData.name,
        validStationData.streamUrl,
        validStationData.slug,
        [],
        undefined,
        undefined,
        'Spain'
      )
      expect(station.metadata).toBe('Spain')
    })

    it('should return empty metadata when no genre or country', () => {
      const station = new Station(
        validStationData.id,
        validStationData.name,
        validStationData.streamUrl,
        validStationData.slug
      )
      expect(station.metadata).toBe('')
    })
  })

  describe('Premium Features', () => {
    it('should identify premium station', () => {
      const station = new Station(
        validStationData.id,
        validStationData.name,
        validStationData.streamUrl,
        validStationData.slug,
        [],
        undefined,
        undefined,
        undefined,
        undefined,
        true
      )
      expect(station.requiresPremium).toBe(true)
    })

    it('should identify free station', () => {
      const station = new Station(
        validStationData.id,
        validStationData.name,
        validStationData.streamUrl,
        validStationData.slug,
        [],
        undefined,
        undefined,
        undefined,
        undefined,
        false
      )
      expect(station.requiresPremium).toBe(false)
    })
  })

  describe('Tags and Categories', () => {
    it('should return primary genre from tags', () => {
      const station = new Station(
        validStationData.id,
        validStationData.name,
        validStationData.streamUrl,
        validStationData.slug,
        ['rock', 'classic', 'music']
      )
      expect(station.primaryGenre).toBe('rock')
    })

    it('should fallback to genre property if no tags', () => {
      const station = new Station(
        validStationData.id,
        validStationData.name,
        validStationData.streamUrl,
        validStationData.slug,
        [],
        undefined,
        undefined,
        undefined,
        'Jazz'
      )
      expect(station.primaryGenre).toBe('Jazz')
    })

    it('should return top 3 related tags', () => {
      const station = new Station(
        validStationData.id,
        validStationData.name,
        validStationData.streamUrl,
        validStationData.slug,
        ['rock', 'classic', 'music', 'oldies', 'hits']
      )
      expect(station.getRelatedTags()).toEqual(['rock', 'classic', 'music'])
    })

    it('should return all tags if less than 3', () => {
      const station = new Station(
        validStationData.id,
        validStationData.name,
        validStationData.streamUrl,
        validStationData.slug,
        ['rock', 'classic']
      )
      expect(station.getRelatedTags()).toEqual(['rock', 'classic'])
    })
  })

  describe('SEO Features', () => {
    it('should generate canonical URL', () => {
      const station = new Station(
        '123',
        validStationData.name,
        validStationData.streamUrl,
        validStationData.slug
      )
      expect(station.getCanonicalUrl('https://example.com')).toBe('https://example.com/radio/123')
    })

    it('should include SEO metadata when provided', () => {
      const seoMetadata: SEOMetadata = {
        title: 'Test Radio - Listen Live',
        description: 'Listen to Test Radio online',
        keywords: ['radio', 'music', 'live'],
        canonicalUrl: 'https://example.com/radio/test',
        imageUrl: 'https://example.com/image.jpg',
        alternateNames: ['Test FM', 'Test Radio Station'],
        lastModified: '2024-01-01'
      }

      const station = new Station(
        validStationData.id,
        validStationData.name,
        validStationData.streamUrl,
        validStationData.slug,
        [],
        seoMetadata
      )

      expect(station.seoMetadata).toBeDefined()
      expect(station.seoMetadata?.title).toBe('Test Radio - Listen Live')
      expect(station.seoMetadata?.keywords).toContain('radio')
    })
  })

  describe('Serialization', () => {
    it('should convert to JSON (DTO)', () => {
      const station = new Station(
        validStationData.id,
        validStationData.name,
        validStationData.streamUrl,
        validStationData.slug,
        validStationData.tags,
        undefined,
        validStationData.imageUrl,
        validStationData.country,
        validStationData.genre,
        validStationData.isPremium,
        validStationData.description,
        validStationData.bitrate,
        validStationData.votes
      )

      const json = station.toJSON()
      
      expect(json.id).toBe('123')
      expect(json.name).toBe('Test Radio')
      expect(json.streamUrl).toBe('https://stream.example.com/radio')
      expect(json.tags).toEqual(['rock', 'classic', 'music'])
      expect(json.country).toBe('Spain')
    })

    it('should include computed properties in JSON', () => {
      const station = new Station(
        validStationData.id,
        validStationData.name,
        validStationData.streamUrl,
        validStationData.slug,
        ['rock', 'classic'],
        undefined,
        validStationData.imageUrl,
        'Spain',
        'Rock'
      )

      const json = station.toJSON()
      
      expect(json.displayName).toBe('Test Radio')
      expect(json.metadata).toBe('Rock • Spain')
      expect(json.primaryGenre).toBe('rock')
    })
  })
})

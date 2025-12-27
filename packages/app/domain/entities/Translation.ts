/**
 * Translation Entity
 * Represents a translated text in the domain
 */

import { Locale } from '../valueObjects/Locale'

export interface TranslationParams {
  [key: string]: string | number | boolean
}

export class Translation {
  constructor(
    public readonly key: string,
    public readonly value: string,
    public readonly locale: Locale,
    public readonly namespace?: string,
    public readonly metadata?: {
      context?: string
      description?: string
      lastModified?: Date
    }
  ) {
    this.validate()
  }

  private validate(): void {
    if (!this.key || this.key.trim() === '') {
      throw new Error('Translation key is required and cannot be empty')
    }
    
    if (!this.value || this.value.trim() === '') {
      throw new Error('Translation value is required and cannot be empty')
    }

    // Validate key format (should be dot notation: category.subcategory.key)
    if (!/^[a-z0-9_.]+$/i.test(this.key)) {
      throw new Error(`Invalid translation key format: ${this.key}. Use alphanumeric characters, dots, and underscores only.`)
    }
  }

  /**
   * Gets the full key including namespace
   */
  get fullKey(): string {
    return this.namespace ? `${this.namespace}.${this.key}` : this.key
  }

  /**
   * Interpolates parameters into the translation value
   * Example: "Hello {name}!" with {name: "John"} -> "Hello John!"
   */
  interpolate(params: TranslationParams): string {
    let result = this.value

    // Replace all {key} patterns with their values
    Object.entries(params).forEach(([key, value]) => {
      const placeholder = new RegExp(`\\{${key}\\}`, 'g')
      result = result.replace(placeholder, String(value))
    })

    // Warn if there are unresolved placeholders
    const unresolvedPlaceholders = result.match(/\{[^}]+\}/g)
    if (unresolvedPlaceholders) {
      console.warn(
        `Unresolved placeholders in translation "${this.fullKey}": ${unresolvedPlaceholders.join(', ')}`
      )
    }

    return result
  }

  /**
   * Handles pluralization
   * Example: "{count} item|{count} items" with count=1 -> "1 item"
   */
  pluralize(count: number): string {
    const forms = this.value.split('|')
    
    if (forms.length === 1) {
      // No plural form defined
      return this.interpolate({ count })
    }

    // Simple pluralization rules
    // More complex rules should be in a separate PluralRules service
    const formIndex = count === 1 ? 0 : 1
    const form = forms[formIndex] || forms[0]
    
    return form.replace('{count}', String(count))
  }

  /**
   * Creates a copy with a different value (for overrides)
   */
  withValue(newValue: string): Translation {
    return new Translation(
      this.key,
      newValue,
      this.locale,
      this.namespace,
      this.metadata
    )
  }

  /**
   * Creates a copy with different metadata
   */
  withMetadata(metadata: Translation['metadata']): Translation {
    return new Translation(
      this.key,
      this.value,
      this.locale,
      this.namespace,
      metadata
    )
  }

  /**
   * Checks if this translation is empty
   */
  isEmpty(): boolean {
    return this.value.trim() === ''
  }

  /**
   * Checks if this translation has unresolved placeholders
   */
  hasPlaceholders(): boolean {
    return /\{[^}]+\}/.test(this.value)
  }

  /**
   * Gets all placeholder keys in this translation
   */
  getPlaceholders(): string[] {
    const matches = this.value.match(/\{([^}]+)\}/g)
    if (!matches) return []
    
    return matches.map(match => match.slice(1, -1))
  }

  /**
   * Checks equality with another Translation
   */
  equals(other: Translation): boolean {
    return (
      this.key === other.key &&
      this.value === other.value &&
      this.locale.equals(other.locale) &&
      this.namespace === other.namespace
    )
  }

  /**
   * Returns string representation
   */
  toString(): string {
    return `${this.fullKey} (${this.locale.code}): ${this.value}`
  }

  /**
   * Returns JSON representation
   */
  toJSON() {
    return {
      key: this.key,
      value: this.value,
      locale: this.locale.code,
      namespace: this.namespace,
      metadata: this.metadata
    }
  }
}

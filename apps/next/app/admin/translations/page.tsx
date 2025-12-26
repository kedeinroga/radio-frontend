'use client'

import { useState } from 'react'
import { adminApiRepository } from '@radio-app/app'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface Translation {
  station_id: string
  language_code: string
  title: string
  description: string
  keywords: string[]
  created_at?: string
  updated_at?: string
}

const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
]

export default function TranslationsPage() {
  const [stationId, setStationId] = useState('')
  const [translations, setTranslations] = useState<Translation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Load translations for a station
  const loadTranslations = async () => {
    if (!stationId.trim()) {
      setError('Please enter a Station ID')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await adminApiRepository.getStationTranslations(stationId.trim())
      setTranslations(response.data || [])
    } catch (err: any) {
      console.error('Error loading translations:', err)
      setError(err.response?.data?.message || err.message || 'Failed to load translations')
      setTranslations([])
    } finally {
      setLoading(false)
    }
  }

  // Delete translation
  const handleDelete = async (lang: string) => {
    if (!confirm(`Are you sure you want to delete the ${lang} translation?`)) {
      return
    }

    try {
      await adminApiRepository.deleteTranslation(stationId, lang)
      await loadTranslations()
    } catch (err: any) {
      console.error('Error deleting translation:', err)
      setError(err.response?.data?.message || 'Failed to delete translation')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Translation Management</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage station translations for SEO and internationalization
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div>
              <h3 className="text-red-800 dark:text-red-200 font-semibold mb-2">Error</h3>
              <p className="text-red-600 dark:text-red-300">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-600 dark:text-red-400 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Station */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Search Station by ID
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={stationId}
            onChange={(e) => setStationId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadTranslations()}
            placeholder="Enter station UUID (e.g., 550e8400-e29b-41d4-a716-446655440000)"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={loadTranslations}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner message="Loading translations..." />
        </div>
      )}

      {/* Translations List */}
      {!loading && translations.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Translations for Station: {stationId}
            </h2>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              + Add Translation
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {translations.map((translation) => (
              <TranslationCard
                key={translation.language_code}
                translation={translation}
                onEdit={() => setEditingTranslation(translation)}
                onDelete={() => handleDelete(translation.language_code)}
              />
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && stationId && translations.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <span className="text-6xl mb-4 block">📝</span>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Translations Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This station doesn't have any translations yet.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Create First Translation
          </button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateForm || editingTranslation) && (
        <TranslationFormModal
          stationId={stationId}
          translation={editingTranslation}
          onClose={() => {
            setShowCreateForm(false)
            setEditingTranslation(null)
          }}
          onSuccess={() => {
            setShowCreateForm(false)
            setEditingTranslation(null)
            loadTranslations()
          }}
        />
      )}
    </div>
  )
}

function TranslationCard({
  translation,
  onEdit,
  onDelete,
}: {
  translation: Translation
  onEdit: () => void
  onDelete: () => void
}) {
  const language = LANGUAGES.find((l) => l.code === translation.language_code)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{language?.flag || '🌍'}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {language?.name || translation.language_code}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {translation.language_code.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Title</p>
          <p className="text-sm text-gray-900 dark:text-white font-medium">{translation.title}</p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</p>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {translation.description}
          </p>
        </div>

        {translation.keywords && translation.keywords.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Keywords</p>
            <div className="flex flex-wrap gap-2">
              {translation.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TranslationFormModal({
  stationId,
  translation,
  onClose,
  onSuccess,
}: {
  stationId: string
  translation: Translation | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    language_code: translation?.language_code || 'es',
    title: translation?.title || '',
    description: translation?.description || '',
    keywords: translation?.keywords?.join(', ') || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      setError(null)

      const data = {
        title: formData.title,
        description: formData.description,
        keywords: formData.keywords
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k.length > 0),
      }

      if (translation) {
        // Update existing
        await adminApiRepository.updateTranslation(stationId, translation.language_code, data)
      } else {
        // Create new
        await adminApiRepository.createTranslation({
          station_id: stationId,
          language_code: formData.language_code,
          ...data,
        })
      }

      onSuccess()
    } catch (err: any) {
      console.error('Error saving translation:', err)
      setError(err.response?.data?.message || err.message || 'Failed to save translation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {translation ? 'Edit Translation' : 'Create Translation'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Language Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Language
            </label>
            <select
              value={formData.language_code}
              onChange={(e) => setFormData({ ...formData, language_code: e.target.value })}
              disabled={!!translation}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name} ({lang.code})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              maxLength={200}
              placeholder="Rock FM 100.1 - Free Online Radio"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={4}
              placeholder="Listen to the best classic rock hits from the 80s and 90s on Rock FM 100.1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              placeholder="rock, classic rock, 80s, radio, music"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Separate keywords with commas
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : translation ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

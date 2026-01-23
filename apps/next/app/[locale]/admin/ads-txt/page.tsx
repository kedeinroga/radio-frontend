/**
 * ads.txt Admin Dashboard
 * 
 * Panel para verificar y validar el archivo ads.txt.
 * Accesible en: /admin/ads-txt
 */

'use client'

import { useEffect, useState } from 'react'
import { checkAdsTxt } from '@/lib/monitoring/ads-txt-check'

interface ValidationResult {
  valid: boolean
  url: string
  entries: number
  parsedEntries?: Array<{
    domain: string
    publisherId: string
    relationship: string
    certAuthorityId?: string
    lineNumber: number
  }>
  variables?: Record<string, string>
  errors?: string[]
  warnings?: string[]
}

export default function AdsTxtDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [healthCheck, setHealthCheck] = useState<any>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)

  useEffect(() => {
    loadAdsTxtStatus()
  }, [])

  const loadAdsTxtStatus = async () => {
    setIsLoading(true)

    try {
      // Check availability
      const health = await checkAdsTxt()
      setHealthCheck(health)

      // Validate format
      const validationResponse = await fetch('/api/ads-txt/validate')
      const validationData = await validationResponse.json()
      setValidation(validationData)
    } catch (err) {
      console.error('Failed to load ads.txt status:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ads.txt status...</p>
        </div>
      </div>
    )
  }

  const isHealthy = healthCheck?.available && validation?.valid

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ads.txt Configuration
          </h1>
          <p className="text-gray-600">
            Authorized Digital Sellers verification and validation
          </p>
        </div>

        {/* Overall Status */}
        <div className={`p-6 rounded-lg mb-6 ${
          isHealthy ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
        }`}>
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-3 ${
              isHealthy ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <div>
              <h2 className="text-xl font-semibold">
                {isHealthy ? '✅ ads.txt is configured correctly' : '❌ ads.txt has issues'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {healthCheck?.url}
              </p>
            </div>
          </div>
        </div>

        {/* Availability Check */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">📡 Availability Check</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                healthCheck?.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {healthCheck?.available ? 'Available' : 'Not Available'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">HTTP Status:</span>
              <span className={`font-mono ${
                healthCheck?.statusCode === 200 ? 'text-green-600' : 'text-red-600'
              }`}>
                {healthCheck?.statusCode || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Content-Type:</span>
              <span className="font-mono text-sm">{healthCheck?.contentType || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium">Has Content:</span>
              <span>{healthCheck?.hasContent ? '✅ Yes' : '❌ No'}</span>
            </div>
          </div>
        </div>

        {/* Format Validation */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">✅ Format Validation</h3>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Valid Format:</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                validation?.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {validation?.valid ? 'Valid' : 'Invalid'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="font-medium">Total Entries:</span>
              <span className="font-semibold">{validation?.entries || 0}</span>
            </div>
          </div>

          {/* Variables */}
          {validation?.variables && Object.keys(validation.variables).length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Variables:</h4>
              <div className="bg-gray-50 rounded p-3 space-y-1">
                {Object.entries(validation.variables).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="font-mono text-sm text-gray-600">{key}=</span>
                    <span className="font-mono text-sm ml-2">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Parsed Entries */}
        {validation?.parsedEntries && validation.parsedEntries.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">📋 Parsed Entries</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domain</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Publisher ID</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Relationship</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">TAG ID</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {validation.parsedEntries.map((entry, index) => (
                    <tr key={index}>
                      <td className="px-3 py-3 text-sm font-mono">{entry.domain}</td>
                      <td className="px-3 py-3 text-sm font-mono">{entry.publisherId}</td>
                      <td className="px-3 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs ${
                          entry.relationship === 'DIRECT' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {entry.relationship}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-sm font-mono text-gray-500">
                        {entry.certAuthorityId || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Errors */}
        {validation?.errors && validation.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-900 mb-3">❌ Errors</h3>
            <ul className="space-y-2">
              {validation.errors.map((error, index) => (
                <li key={index} className="text-sm text-red-800 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {validation?.warnings && validation.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">⚠️ Warnings</h3>
            <ul className="space-y-2">
              {validation.warnings.map((warning, index) => (
                <li key={index} className="text-sm text-yellow-800 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">🔧 Actions</h3>
          <div className="space-y-3">
            <button
              onClick={loadAdsTxtStatus}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              🔄 Refresh Status
            </button>
            <a
              href="/ads.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-2 bg-gray-600 text-white text-center rounded-lg hover:bg-gray-700 transition"
            >
              👁️ View ads.txt File
            </a>
            <a
              href="https://adstxt.guru/"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition"
            >
              🔍 Validate with ads.txt Guru
            </a>
          </div>
        </div>

        {/* Documentation */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">📚 Documentation</h4>
          <p className="text-sm text-blue-800 mb-2">
            The ads.txt file is located at: <code className="bg-blue-100 px-1 rounded">apps/next/public/ads.txt</code>
          </p>
          <p className="text-sm text-blue-800">
            Learn more: <a href="https://iabtechlab.com/ads-txt/" target="_blank" rel="noopener noreferrer" className="underline">IAB ads.txt Specification</a>
          </p>
        </div>
      </div>
    </div>
  )
}

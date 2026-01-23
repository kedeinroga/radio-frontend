/**
 * AdClickHandler Usage Examples
 * 
 * Demuestra diferentes formas de usar AdClickHandler para manejar clicks
 * en anuncios con protección CSRF.
 */

import { AdClickHandler, useAdClickHandler, type ClickTrackingResult } from './AdClickHandler'
import type { Advertisement } from '@radio-app/app'

// Mock advertisement para los ejemplos
const mockAd: Advertisement = {
  id: 'ad-123',
  campaignId: 'campaign-456',
  title: 'Example Advertisement',
  description: 'This is a demo ad',
  advertiserName: 'Demo Advertiser',
  adFormat: 'banner',
  adType: 'image',
  mediaUrl: 'https://example.com/ad-image.jpg',
  clickUrl: 'https://example.com/landing-page',
  width: 728,
  height: 90,
  status: 'active',
  priority: 1,
  impressionsCount: 1000,
  clicksCount: 50,
  spendCents: 5000,
  startDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}

/**
 * Ejemplo 1: Usando el componente AdClickHandler con render prop
 */
export function Example1_RenderProp() {
  const handleClickTracked = (result: ClickTrackingResult) => {
    if (result.success) {

    } else {

    }
  }

  const handleError = (error: string) => {

    // Aquí podrías mostrar un toast o notificación al usuario
  }

  return (
    <AdClickHandler
      ad={mockAd}
      impressionId="imp-789"
      onClickTracked={handleClickTracked}
      onError={handleError}
      openAfterTracking={true}
      linkTarget="_blank"
    >
      {(handleClick, isTracking) => (
        <button
          onClick={handleClick}
          disabled={isTracking}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isTracking ? 'Tracking...' : 'Click Me'}
        </button>
      )}
    </AdClickHandler>
  )
}

/**
 * Ejemplo 2: Usando el hook useAdClickHandler
 */
export function Example2_Hook() {
  const { handleClick, isTracking } = useAdClickHandler({
    ad: mockAd,
    impressionId: 'imp-790',
    onClickTracked: (result) => {

    },
    onError: (error) => {

    },
  })

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{mockAd.title}</h3>
      <p className="text-gray-600 mb-4">{mockAd.description}</p>
      <button
        onClick={handleClick}
        disabled={isTracking}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {isTracking ? '⏳ Processing...' : '👆 Learn More'}
      </button>
    </div>
  )
}

/**
 * Ejemplo 3: Banner clickeable completo
 */
export function Example3_ClickableBanner() {
  const { handleClick, isTracking } = useAdClickHandler({
    ad: mockAd,
    impressionId: 'imp-791',
    onClickTracked: (result) => {
      if (result.success && result.fraudScore !== undefined) {
        if (result.fraudScore > 70) {

        } else {

        }
      }
    },
    openAfterTracking: true,
    linkTarget: '_blank',
  })

  return (
    <div
      onClick={handleClick}
      className={`
        relative cursor-pointer overflow-hidden rounded-lg
        transition-transform hover:scale-[1.02]
        ${isTracking ? 'opacity-50 cursor-wait' : ''}
      `}
      style={{
        width: mockAd.width,
        height: mockAd.height,
        backgroundImage: `url(${mockAd.mediaUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Ad label */}
      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
        Ad
      </div>

      {/* Loading overlay */}
      {isTracking && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        </div>
      )}
    </div>
  )
}

/**
 * Ejemplo 4: Native ad card clickeable
 */
export function Example4_NativeAdCard() {
  return (
    <AdClickHandler
      ad={mockAd}
      impressionId="imp-792"
      onClickTracked={(result) => {

      }}
    >
      {(handleClick, isTracking) => (
        <article
          onClick={handleClick}
          className={`
            max-w-sm rounded-lg border shadow-sm overflow-hidden
            transition-all hover:shadow-lg cursor-pointer
            ${isTracking ? 'opacity-75 cursor-wait' : ''}
          `}
        >
          {/* Image */}
          <div className="relative aspect-video bg-gray-200">
            <img
              src={mockAd.mediaUrl}
              alt={mockAd.title}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-2 left-2 bg-yellow-400 text-xs px-2 py-1 rounded font-semibold">
              Sponsored
            </span>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-xl font-bold mb-2">{mockAd.title}</h3>
            <p className="text-gray-600 mb-3 line-clamp-2">{mockAd.description}</p>
            <p className="text-sm text-gray-500 mb-4">by {mockAd.advertiserName}</p>

            <button
              disabled={isTracking}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isTracking ? 'Processing...' : 'Learn More →'}
            </button>
          </div>
        </article>
      )}
    </AdClickHandler>
  )
}

/**
 * Ejemplo 5: Custom click handler sin navegación automática
 */
export function Example5_CustomNavigation() {
  const { handleClick, isTracking } = useAdClickHandler({
    ad: mockAd,
    impressionId: 'imp-793',
    openAfterTracking: false, // ⚠️ No abrir automáticamente
    onClickTracked: (result) => {
      if (result.success) {
        // Lógica personalizada después del tracking

        // Podrías mostrar un modal, hacer analytics extra, etc.
        // Y LUEGO abrir el link manualmente:
        window.open(mockAd.clickUrl, '_blank', 'noopener,noreferrer')
      }
    },
  })

  return (
    <button
      onClick={handleClick}
      disabled={isTracking}
      className="px-6 py-3 bg-purple-600 text-white rounded-lg"
    >
      Custom Click Handling
    </button>
  )
}

/**
 * Ejemplo 6: Manejo de errores con UI feedback
 */
export function Example6_ErrorHandling() {
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

  const { handleClick, isTracking } = useAdClickHandler({
    ad: mockAd,
    impressionId: 'imp-794',
    onClickTracked: (result) => {
      if (result.success) {
        setSuccessMessage('Ad clicked successfully!')
        setErrorMessage(null)
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        setErrorMessage(result.error || 'Unknown error')
        setSuccessMessage(null)
      }
    },
    onError: (error) => {
      setErrorMessage(error)
      setSuccessMessage(null)
    },
  })

  return (
    <div className="space-y-4">
      <button
        onClick={handleClick}
        disabled={isTracking}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {isTracking ? 'Processing...' : 'Click Ad'}
      </button>

      {/* Success message */}
      {successMessage && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          ✅ {successMessage}
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ {errorMessage}
        </div>
      )}
    </div>
  )
}

// Import React for Example 6
import React from 'react'

/**
 * Main demo page
 */
export default function AdClickHandlerExamples() {
  return (
    <div className="container mx-auto p-8 space-y-12">
      <h1 className="text-4xl font-bold mb-8">AdClickHandler Examples</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-4">1. Render Prop Pattern</h2>
        <Example1_RenderProp />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">2. Hook Pattern</h2>
        <Example2_Hook />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">3. Clickable Banner</h2>
        <Example3_ClickableBanner />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">4. Native Ad Card</h2>
        <Example4_NativeAdCard />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">5. Custom Navigation</h2>
        <Example5_CustomNavigation />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">6. Error Handling</h2>
        <Example6_ErrorHandling />
      </section>
    </div>
  )
}

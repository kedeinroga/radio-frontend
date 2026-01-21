/**
 * Example: Using Ad Components
 * 
 * This file demonstrates how to use the ad components in a Next.js page.
 */

'use client'

import { AdContainer } from './AdContainer'

export default function ExamplePageWithAds() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Radio Station Search</h1>

      {/* Banner ad at top of page */}
      <div style={{ marginBottom: '24px' }}>
        <AdContainer
          placement="search_banner"
          format="banner"
          context={{
            deviceType: 'desktop',
            country: 'US',
            language: 'en',
          }}
        />
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Left column: Station list */}
        <div>
          <h2>Search Results</h2>
          
          {/* Station results would go here */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              Station 1
            </div>
          </div>

          {/* Native ad in station list */}
          <div style={{ marginBottom: '16px' }}>
            <AdContainer
              placement="search_native"
              format="native"
              nativeVariant="list"
              context={{
                deviceType: 'desktop',
                country: 'US',
                language: 'en',
                genre: 'rock',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              Station 2
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
              Station 3
            </div>
          </div>
        </div>

        {/* Right column: Sidebar */}
        <div>
          <h3>Trending</h3>
          
          {/* Sidebar banner ad */}
          <div style={{ marginBottom: '16px' }}>
            <AdContainer
              placement="station_list_banner"
              format="banner"
              context={{
                deviceType: 'desktop',
                country: 'US',
                language: 'en',
              }}
            />
          </div>

          {/* Sidebar content */}
          <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <p>Trending stations...</p>
          </div>
        </div>
      </div>

      {/* Bottom native ad */}
      <div style={{ marginTop: '48px' }}>
        <h3>Recommended for You</h3>
        <AdContainer
          placement="station_list_native"
          format="native"
          nativeVariant="card"
          context={{
            deviceType: 'desktop',
            country: 'US',
            language: 'en',
          }}
        />
      </div>
    </div>
  )
}

const path = require('path');

// Check if we're in build mode to skip data collection
const isBuild = process.env.NODE_ENV === 'production' && process.argv.includes('build');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile packages from monorepo
  transpilePackages: [
    '@radio-app/app',
    // Add any other workspace packages that need transpiling
  ],
  reactStrictMode: true,
  
  // Skip type checking and linting during build in Vercel
  // This helps avoid issues with monorepo workspace dependencies
  typescript: {
    ignoreBuildErrors: true, // Skip TypeScript errors during build
  },
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint during builds
  },
  
  // Configure output file tracing for monorepo (moved from experimental)
  // This helps Vercel correctly trace and include files from workspace packages
  outputFileTracingRoot: path.join(__dirname, '../../'),
  
  // Experimental features
  experimental: {
    // Let Next.js use optimal settings for build
    // Removed artificial restrictions that were causing build crashes
  },
  
  // CRITICAL: Increase timeout for page generation to prevent worker crashes
  staticPageGenerationTimeout: 180, // 3 minutes (increased from 120)
  
  // CRITICAL: Use standalone output for optimal Vercel deployment
  // This creates a minimal production build
  output: 'standalone',
  
  // Webpack configuration to resolve path aliases
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };
    
    // Exclude React Native from bundle
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-native$': 'react-native-web',
      };
    }
    
    // Optimize build for serverless
    if (isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'named',
      };
      
      // Don't bundle react-native on server
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('react-native');
      }
      
      // Let webpack use default optimizations for better performance
      // Removed artificial restrictions (runtimeChunk/splitChunks = false)
    }
    
    return config;
  },
  
  // Performance optimizations for Vercel free tier
  compress: true, // Enable gzip compression
  poweredByHeader: false, // Remove X-Powered-By header
  
  // Production optimizations
  productionBrowserSourceMaps: false, // Disable source maps in production to save space
  
  // Output configuration
  output: 'standalone', // Optimize for serverless
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    // Optimize for Vercel free tier
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    dangerouslyAllowSVG: false, // Disable SVG to prevent XSS
    contentDispositionType: 'attachment', // Force download for unsafe files
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
    // Production: https://api.rradio.online/api/v1
    // Tell the app we're in build mode to skip data fetching
    IS_BUILD_TIME: isBuild ? 'true' : 'false',
  },
  
  // Security Headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Restrict browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // XSS Protection (legacy browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Force HTTPS in production
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // Content Security Policy
          // Using report-only mode to monitor violations without blocking
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval and unsafe-inline
              "style-src 'self' 'unsafe-inline'", // Required for styled-components/emotion
              "img-src 'self' data: https: http: blob:", // Allow images from any HTTPS/HTTP source
              "font-src 'self' data:",
              "connect-src 'self' https://api.rradio.online https://api.rradio.online/api/v1 https://radio-backend-296736956418.us-central1.run.app http://localhost:8080 http://localhost:8080/api/v1 ws://localhost:3000", // Allow API and WebSocket
              "media-src 'self' https: http: blob:", // Allow audio streaming from HTTP/HTTPS
              "object-src 'none'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "report-uri /api/csp-report", // CSP violation reporting endpoint
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

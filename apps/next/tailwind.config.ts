import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    // More specific patterns to avoid scanning node_modules
    '../../packages/app/components/**/*.tsx',
    '../../packages/app/domain/entities/*.ts',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        amber: {
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F5A30A',
          600: '#D97706',
          700: '#B45309',
        },
        surface: {
          800: '#22222E',
          900: '#1A1A24',
          950: '#0D0D12',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        broadcast: ['"Space Mono"', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}
export default config

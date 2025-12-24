# Radio App

Universal Radio App built with Solito, sharing code between Next.js (web) and Expo (mobile).

## ✅ SEO Implementation Complete

**New**: Full SEO implementation with SSR, ISR, dynamic sitemap, and JSON-LD schemas.  
� See [SEO_SUMMARY.md](./SEO_SUMMARY.md) for details.

## �🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development servers
npm run dev

# Build for production
npm run build

# Test SEO features
npm run build && npm start
# Then visit:
# - http://localhost:3000/sitemap.xml
# - http://localhost:3000/robots.txt
# - http://localhost:3000/radio/[slug]
```

## 📁 Project Structure

```
radio-app/
├── apps/
│   ├── next/          # Next.js web app
│   │   ├── app/
│   │   │   ├── radio/[slug]/       # SSR station pages
│   │   │   ├── country/[code]/     # ISR country pages
│   │   │   ├── genre/[tag]/        # ISR genre pages
│   │   │   ├── sitemap.ts          # Dynamic sitemap
│   │   │   └── robots.ts           # Robots.txt
│   └── expo/          # Expo mobile app
├── packages/
│   └── app/           # Shared code (90% of the app)
│       ├── components/    # UI components
│       │   └── SEO/       # SEO components (JsonLd, Breadcrumbs)
│       ├── domain/        # Business entities
│       │   └── entities/  # Station, SEOMetadata, PopularCountry/Tag
│       ├── application/   # Use cases
│       │   └── useCases/
│       │       └── seo/   # GetPopularCountries, GetSitemapData
│       ├── infrastructure/# External services
│       │   └── api/       # StationApiRepository, SEOApiRepository
│       └── presentation/  # Screens & hooks
└── turbo.json         # Turborepo config
```

## 🎨 Design Principles

- **Accessible**: WCAG 2.1 AA compliant
- **Intuitive**: Familiar patterns, clear navigation
- **Responsive**: Mobile-first, works everywhere
- **Fast**: Optimistic updates, instant feedback
- **SEO-Optimized**: SSR, ISR, JSON-LD schemas, dynamic sitemap

## 🛠️ Tech Stack

- **Monorepo**: Turborepo
- **Web**: Next.js 15.1.9+
- **Mobile**: Expo SDK 51+
- **Styling**: NativeWind v4 (TailwindCSS)
- **State**: Zustand + TanStack Query
- **Auth**: JWT Backend
- **Audio**: Howler.js (web) + react-native-track-player (mobile)
- **SEO**: Server Components, ISR, JSON-LD, Dynamic Sitemap

## 📱 Features

- 🎵 Stream radio stations
- ❤️ Save favorites
- 🔍 Search by name, genre, country
- 🌍 Internationalization (EN, ES, PT)
- 🌙 Dark mode
- ♿ Fully accessible

## 📄 License

MIT

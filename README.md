# Radio App

Universal Radio App built with Solito, sharing code between Next.js (web) and Expo (mobile).

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development servers
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
radio-app/
├── apps/
│   ├── next/          # Next.js web app
│   └── expo/          # Expo mobile app
├── packages/
│   └── app/           # Shared code (90% of the app)
│       ├── components/    # UI components
│       ├── domain/        # Business entities
│       ├── application/   # Use cases
│       ├── infrastructure/# External services
│       └── presentation/  # Screens & hooks
└── turbo.json         # Turborepo config
```

## 🎨 Design Principles

- **Accessible**: WCAG 2.1 AA compliant
- **Intuitive**: Familiar patterns, clear navigation
- **Responsive**: Mobile-first, works everywhere
- **Fast**: Optimistic updates, instant feedback

## 🛠️ Tech Stack

- **Monorepo**: Turborepo
- **Web**: Next.js 15.1.9+
- **Mobile**: Expo SDK 51+
- **Styling**: NativeWind v4 (TailwindCSS)
- **State**: Zustand + TanStack Query
- **Auth**: JWT Backend
- **Audio**: Howler.js (web) + react-native-track-player (mobile)

## 📱 Features

- 🎵 Stream radio stations
- ❤️ Save favorites
- 🔍 Search by name, genre, country
- 🌍 Internationalization (EN, ES, PT)
- 🌙 Dark mode
- ♿ Fully accessible

## 📄 License

MIT

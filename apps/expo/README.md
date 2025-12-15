# Expo App - TODO

This directory is reserved for the Expo mobile application.

## Planned Structure

```
apps/expo/
├── app/                 # Expo Router (file-based navigation)
│   ├── (tabs)/         # Tab navigation
│   │   ├── index.tsx   # Home screen
│   │   ├── search.tsx  # Search screen
│   │   └── profile.tsx # Profile screen
│   ├── station/
│   │   └── [id].tsx    # Station detail screen
│   └── _layout.tsx     # Root layout
├── app.json            # Expo configuration
├── eas.json            # EAS Build configuration
├── package.json
└── tsconfig.json
```

## Setup Instructions (Future)

```bash
cd apps/expo
npx create-expo-app@latest . --template blank-typescript
npx expo install expo-router solito
npx expo install react-native-track-player
npx expo install expo-secure-store
```

## Key Features to Implement

- [ ] Expo Router setup
- [ ] Solito navigation integration
- [ ] Background audio playback
- [ ] Secure token storage
- [ ] Push notifications (optional)
- [ ] Deep linking

## Notes

- Will share 90% of code with Next.js via `packages/app`
- Focus on platform-specific features (audio, notifications)
- Use react-native-track-player for background playback

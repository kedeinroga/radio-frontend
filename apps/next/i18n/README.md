# Translation Files Documentation

## 📁 Structure

Translation files are organized by locale in the `i18n/locales/` directory:

```
i18n/locales/
├── es.json  (Spanish - Default)
├── en.json  (English)
├── fr.json  (French)
└── de.json  (German)
```

## 🗂️ Namespaces

Each translation file is organized into the following namespaces:

### 1. `common`
Common UI elements used throughout the application:
- Buttons: `loading`, `error`, `retry`, `cancel`, `save`, `delete`, `edit`, `close`
- Actions: `search`, `filter`, `sort`, `confirm`
- Status: `noResults`, `yes`, `no`

### 2. `navigation`
Navigation-related translations:
- Menu items: `home`, `favorites`, `search`, `discover`, `admin`
- User actions: `login`, `logout`, `profile`, `settings`
- ARIA labels for accessibility

### 3. `player`
Audio player controls and states:
- Controls: `play`, `pause`, `stop`, `volume`, `mute`, `unmute`
- Status: `loading`, `buffering`, `nowPlaying`, `error`
- ARIA labels: `playStation`, `pauseStation`, `viewDetails`

### 4. `stations`
Radio station related content:
- Categories: `popular`, `recent`, `recommended`, `trending`
- Filters: `byCountry`, `byGenre`
- Info: `country`, `language`, `tags`, `codec`, `bitrate`
- Status: `loadingStations`, `errorLoading`, `noStations`

### 5. `favorites`
Favorites functionality:
- Actions: `addToFavorites`, `removeFromFavorites`
- Status: `noFavorites`, `addedToFavorites`, `removedFromFavorites`

### 6. `search`
Search functionality:
- UI: `title`, `placeholder`, `clearSearch`
- Status: `searching`, `noResults`, `slowSearchWarning`
- Results: `resultsCount` (with pluralization support)

### 7. `auth`
Authentication flows:
- Actions: `login`, `logout`
- Form: `email`, `password`, `rememberMe`, `forgotPassword`
- Status: `loggingIn`, `loginError`, `sessionExpired`

### 8. `admin`
Admin panel translations:
- Sections: `dashboard`, `analytics`, `seo`, `translations`
- Stats: `activeUsers`, `guestUsers`, `popularStations`, `trendingSearches`
- Time ranges: `today`, `week`, `month`, `year`

### 9. `countries` & `genres`
Content organization:
- Titles and navigation
- Station filtering by country/genre

### 10. `errors`
Error messages and handling:
- Types: `generic`, `notFound`, `serverError`, `networkError`, `timeoutError`
- Actions: `goHome`, `reload`

### 11. `seo`
SEO metadata for different pages:
- Pages: `home`, `search`, `favorites`, `station`, `country`, `genre`
- Each with `title` and `description`

### 12. `time`
Relative time formatting:
- Recent: `justNow`, `minuteAgo`, `minutesAgo`
- Past: `hourAgo`, `hoursAgo`, `dayAgo`, `daysAgo`
- Long term: `weekAgo`, `monthAgo`, `yearAgo`

### 13. `app`
Global app information:
- Branding: `title`, `subtitle`
- Meta: `version`, `copyright`, `poweredBy`

## 🔤 Translation Keys Usage

### Interpolation
Use double curly braces for dynamic values:
```json
{
  "player": {
    "viewDetails": "View details of {{name}}"
  }
}
```

Usage in code:
```typescript
t('player.viewDetails', { name: stationName })
```

### Pluralization
Keys with `_other` suffix support pluralization:
```json
{
  "search": {
    "resultsCount": "{{count}} result found",
    "resultsCount_other": "{{count}} results found"
  }
}
```

Usage in code:
```typescript
t('search.resultsCount', { count: results.length })
```

### Nested Keys
Access nested values using dot notation:
```json
{
  "navigation": {
    "ariaLabels": {
      "mainNav": "Main navigation"
    }
  }
}
```

Usage in code:
```typescript
t('navigation.ariaLabels.mainNav')
```

## 🌍 Supported Locales

| Code | Language | Default | RTL |
|------|----------|---------|-----|
| `es` | Spanish  | ✅ | No  |
| `en` | English  | No | No  |
| `fr` | French   | No | No  |
| `de` | German   | No | No  |

## ✅ Translation Completeness

All four language files contain:
- ✅ 13 namespaces
- ✅ ~200+ translation keys
- ✅ Interpolation support
- ✅ Pluralization support
- ✅ Consistent structure across all locales

## 🔄 Adding New Translations

1. Add the key to all locale files (es, en, fr, de)
2. Use a consistent namespace
3. Follow the naming convention (camelCase)
4. Use interpolation for dynamic content: `{{variable}}`
5. Add `_other` suffix for plural forms

Example:
```json
{
  "myNamespace": {
    "newKey": "Static text",
    "withVariable": "Dynamic {{value}}",
    "singular": "{{count}} item",
    "singular_other": "{{count}} items"
  }
}
```

## 🎯 Next Steps

These translation files will be consumed by:
1. **NextIntlAdapter** - Already implemented in infrastructure layer
2. **I18nProvider** - React Context Provider (next step)
3. **useAppTranslation hook** - For components
4. **useAppFormatter hook** - For date/number formatting

## 📝 Notes

- All translations follow the same structure for consistency
- ARIA labels are included for accessibility
- Error messages include both title and description
- SEO metadata is separated for easy management
- Time-relative strings support natural language formats

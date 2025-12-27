# Admin Panel Documentation

## Overview

The admin panel provides a comprehensive interface for managing the radio streaming application. Only users with the `admin` role can access these routes.

## Access Control

### Protected Routes
All routes under `/admin/*` are protected by the `AdminGuard` component, which:
- Checks if the user is authenticated
- Verifies the user has the `admin` role
- Redirects non-admin users to the home page

### User Roles
The system supports three user roles:
- `guest` - Regular users
- `premium` - Premium subscribers
- `admin` - Administrators with full access

## Admin Routes

### 🏠 Dashboard (`/admin`)
Main dashboard showing an overview of system statistics:
- Active users count (authenticated users, last 24h)
- Guest users count (unique IPs, last 24h)
- Popular stations preview (top 5)
- Trending searches preview (top 5)
- Quick links to other admin sections

**Features:**
- Real-time statistics
- Error handling with retry
- Loading states
- Visual cards with icons
- Station favicons display
- Search percentage metrics

### 📈 Analytics (`/admin/analytics`)
Detailed analytics and statistics page:
- Active authenticated users monitoring
- Guest users monitoring
- Popular stations table (top 20) with favicons
- Trending searches table (top 20) with percentages
- Time range selector (hour/day/week/month)

**API Endpoints Used:**
- `GET /analytics/users/active` - Returns `{success: true, data: {count: number}}`
- `GET /analytics/users/guest` - Returns `{success: true, data: {count: number}}`
- `GET /analytics/stations/popular?range=X&limit=Y` - Returns `{success: true, data: [{station_id, name, country, plays, favicon, url}]}`
- `GET /analytics/searches/trending?range=X&limit=Y` - Returns `{success: true, data: [{search_term, count, percentage}]}`

**Features:**
- Filterable by time range (hour/day/week/month)
- Detailed station information with images
- Search query percentages
- Responsive tables with hover effects
- Export-ready data display

### 🌍 Translations (`/admin/translations`)
Manage station translations for SEO and i18n:

**Supported Languages:**
- 🇪🇸 Spanish (es)
- 🇺🇸 English (en)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)

**Features:**
- Search station by ID
- View all translations for a station
- Create new translations
- Edit existing translations
- Delete translations
- Keywords management

**API Endpoints Used:**
- `GET /admin/translations/{stationId}` - List all translations
- `GET /admin/translations/{stationId}/{lang}` - Get specific translation
- `POST /admin/translations` - Create translation
- `PUT /admin/translations/{stationId}/{lang}` - Update translation
- `DELETE /admin/translations/{stationId}/{lang}` - Delete translation
- `POST /admin/translations/bulk` - Create multiple translations

**Translation Fields:**
- **Title** (required, max 200 chars) - SEO title
- **Description** (required) - SEO description
- **Keywords** (optional) - Comma-separated keywords for SEO

### 🔍 SEO Management (`/admin/seo`)
Refresh SEO statistics from the database:

**What Gets Updated:**
- Popular tags with station counts
- Popular countries with station counts
- Sitemap data cache
- SEO metadata for dynamic pages

**When to Use:**
- After importing new stations
- When station data changes significantly
- To update sitemap.xml data
- When SEO data seems outdated

**API Endpoint Used:**
- `POST /admin/seo/refresh-stats`

## Technical Implementation

### Architecture

```
packages/app/
├── domain/entities/User.ts          # User entity with admin role
├── stores/authStore.ts              # Authentication state management
└── infrastructure/api/
    └── AdminApiRepository.ts        # Admin API operations

apps/next/
├── components/
│   └── AdminGuard.tsx               # Route protection component
└── app/admin/
    ├── layout.tsx                   # Admin panel layout & navigation
    ├── page.tsx                     # Dashboard
    ├── analytics/page.tsx           # Analytics page
    ├── translations/page.tsx        # Translation management
    └── seo/page.tsx                 # SEO tools
```

### State Management

**Auth Store (`useAuthStore`)**
```typescript
{
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
  isAdmin: () => boolean
  isPremium: () => boolean
}
```

### API Repository

**AdminApiRepository** provides methods for:
- Analytics operations
- SEO management
- Translation CRUD operations

Example usage:
```typescript
import { adminApiRepository } from '@radio-app/app'

// Get active users
const users = await adminApiRepository.getActiveUsers()

// Refresh SEO stats
await adminApiRepository.refreshSEOStats()

// Create translation
await adminApiRepository.createTranslation({
  station_id: 'uuid',
  language_code: 'en',
  title: 'Rock FM 100.1',
  description: 'Listen live',
  keywords: ['rock', 'music']
})
```

## Security Considerations

1. **Authentication Required**: All admin endpoints require valid JWT token
2. **Role-Based Access**: Backend validates admin role on every request
3. **Client-Side Guard**: `AdminGuard` prevents unauthorized route access
4. **Token Refresh**: Automatic token refresh on expiration

## Error Handling

All admin pages implement:
- Try-catch error handling
- User-friendly error messages
- Retry mechanisms
- Loading states
- Empty state displays

## Styling

The admin panel uses:
- Tailwind CSS for styling
- Dark mode support
- Responsive design (mobile-first)
- Consistent color scheme:
  - Blue: Primary actions
  - Green: Success/Create actions
  - Red: Danger/Delete actions
  - Gray: Neutral elements

## Future Enhancements

Potential features to add:
- [ ] User management (list, edit, delete users)
- [ ] Station management (CRUD operations)
- [ ] Bulk translation import/export
- [ ] Analytics charts and graphs
- [ ] Real-time data updates
- [ ] Activity logs
- [ ] Email notifications for admin events
- [ ] Advanced search and filters
- [ ] Export reports (CSV, PDF)

## Development

### Running Locally

```bash
cd apps/next
npm run dev
```

Navigate to `http://localhost:3000/admin` (requires admin user)

### Testing Admin Features

1. Create an admin user in the database
2. Login with admin credentials
3. Access `/admin` routes
4. Test each functionality

### Adding New Admin Pages

1. Create page under `apps/next/app/admin/`
2. Add route to `adminNavItems` in `layout.tsx`
3. Implement API methods in `AdminApiRepository` if needed
4. Follow existing patterns for consistency

## API Reference

See `swagger.json` for complete API documentation of admin endpoints.

**Base URL**: `/api/v1`
**Authentication**: Bearer token required
**Role Required**: `admin`

## Support

For issues or questions about the admin panel:
1. Check the error messages (they're descriptive)
2. Review browser console for details
3. Check backend logs
4. Verify admin role is set correctly

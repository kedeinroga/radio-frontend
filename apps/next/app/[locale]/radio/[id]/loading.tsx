import { LoadingSpinner } from '@/components/LoadingSpinner'

/**
 * Loading UI for Station Details Page
 * Automatically shown by Next.js during server-side rendering
 */
export default function Loading() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back button skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-10 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        </div>

        {/* Station hero section skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Station image skeleton */}
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse flex-shrink-0" />
            
            {/* Station info skeleton */}
            <div className="flex-1 space-y-4 w-full">
              <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4" />
              <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-1/2" />
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Play button skeleton */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="h-14 w-full md:w-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Loading spinner */}
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    </main>
  )
}

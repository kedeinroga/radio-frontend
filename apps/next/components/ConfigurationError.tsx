/**
 * Configuration Error Component
 * Shows when critical environment variables are missing
 */

export function ConfigurationError({ 
  message, 
  details 
}: { 
  message: string
  details?: string 
}) {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8">
        <div className="flex items-start gap-4">
          {/* Error Icon */}
          <div className="flex-shrink-0">
            <svg
              className="w-12 h-12 text-red-500"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Error Content */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Configuration Error
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              {message}
            </p>
            
            {details && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 mb-4">
                <p className="text-sm font-mono text-gray-600 dark:text-gray-400">
                  {details}
                </p>
              </div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
              <h2 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                For Developers:
              </h2>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>Check that <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">NEXT_PUBLIC_API_URL</code> is set in environment variables</li>
                <li>Verify the backend API is running and accessible</li>
                <li>Check Vercel Environment Variables settings</li>
                <li>See <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">VERCEL_ENV_SETUP.md</code> for configuration guide</li>
              </ul>
            </div>

            <div className="mt-6">
              <a
                href="/"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

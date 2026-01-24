// Force all routes to be dynamic
// This prevents Next.js from trying to collect page data during build
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Empty route handler
export async function GET() {
  return new Response(null, { status: 404 })
}

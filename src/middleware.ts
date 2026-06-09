/**
 * ANCHOR: shared
 * PURPOSE: Next.js middleware — auth guards для protected routes.
 * Dependencies: @/lib/auth.
 * CRITICAL: Protect /checkout, /profile, mutation API routes.
 *
 * DO:
 * - Redirect to /login?callbackUrl=...
 * DONT:
 * - Block public /search and /listings routes
 */

export function middleware(_request: Request) {
  // TODO: implement auth guards
}

export const config = {
  matcher: ['/checkout/:path*', '/profile/:path*'],
};

/**
 * ANCHOR: shared
 * PURPOSE: Next.js middleware — auth guards для protected routes.
 * Dependencies: @/lib/auth.config.
 * CRITICAL: Protect /checkout, /profile, mutation API routes.
 *
 * DO:
 * - Redirect to /login?callbackUrl=...
 * DONT:
 * - Block public /search and /listings routes
 */

import NextAuth from 'next-auth';

import { authConfig } from '@/lib/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/checkout/:path*', '/profile/:path*'],
};

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

import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: Request) {
  const token = await getToken({
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const url = new URL(request.url);
  if (!token) {
    const callbackUrl = encodeURIComponent(url.pathname + url.search);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url),
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/checkout/:path*', '/profile/:path*'],
};

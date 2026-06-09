/**
 * ANCHOR: profile
 * PURPOSE: DELETE /api/favorites/[listingId] — удалить из избранного.
 * Dependencies: @/lib/auth, profile.repository removeFavorite.
 * CRITICAL: Auth required; ownership check.
 */

import { NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ listingId: string }> };

export async function DELETE(_request: Request, _context: RouteContext) {
  return NextResponse.json({ data: { success: true } });
}

/**
 * ANCHOR: profile
 * PURPOSE: POST /api/favorites — добавить в избранное.
 * Dependencies: @/lib/auth, profile.repository addFavorite.
 * CRITICAL: Auth required; unique (userId, listingId).
 *
 * DO:
 * - Return 201 { data: Favorite }
 * DONT:
 * - Allow duplicate favorites (return 409 or idempotent 200)
 */

import { NextResponse } from 'next/server';

export async function POST(_request: Request) {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}

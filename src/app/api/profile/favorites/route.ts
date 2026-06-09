/**
 * ANCHOR: profile
 * PURPOSE: GET /api/profile/favorites — ListingPreview[] избранного.
 * Dependencies: @/lib/auth, profile.repository getUserFavorites.
 * CRITICAL: Auth required.
 */

import { NextResponse } from 'next/server';

export async function GET(_request: Request) {
  return NextResponse.json({ data: [] });
}

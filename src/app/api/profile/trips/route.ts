/**
 * ANCHOR: profile
 * PURPOSE: GET /api/profile/trips — список поездок пользователя.
 * Dependencies: @/lib/auth, profile.repository getUserTrips.
 * CRITICAL: Auth required; filter by session userId only.
 *
 * DO:
 * - Query status?: upcoming|history
 * DONT:
 * - Accept userId from query string
 */

import { NextResponse } from 'next/server';

export async function GET(_request: Request) {
  return NextResponse.json({ data: [] });
}

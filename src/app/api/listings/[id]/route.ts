/**
 * ANCHOR: listing
 * PURPOSE: GET /api/listings/[id] — детали объекта (ListingDetail).
 * Dependencies: listing.repository getListingById.
 *
 * DO:
 * - Return { data: ListingDetail } or 404
 * DONT:
 * - Expose host passwordHash or internal fields
 */

import { NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, _context: RouteContext) {
  return NextResponse.json({ data: null }, { status: 404 });
}

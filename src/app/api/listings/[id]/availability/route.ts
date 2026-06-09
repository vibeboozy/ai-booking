/**
 * ANCHOR: listing
 * PURPOSE: GET /api/listings/[id]/availability — календарь free/booked/past.
 * Dependencies: listing.repository getAvailability.
 *
 * DO:
 * - Query month?: YYYY-MM
 * - Return { data: AvailabilityDay[] }
 * DONT:
 * - Return raw Booking records with user PII
 */

import { NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, _context: RouteContext) {
  return NextResponse.json({ data: [] });
}

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
import { getAvailability } from '@/modules/listing/listing.repository';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const url = new URL(request.url);
  const month = url.searchParams.get('month') ?? undefined;

  const availability = await getAvailability(id, month);

  return NextResponse.json({ data: availability });
}

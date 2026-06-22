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
import { getListingById } from '@/modules/listing/listing.repository';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 },
      );
    }

    const listing = await getListingById(id);

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({ data: listing });
  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

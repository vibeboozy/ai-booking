/**
 * ANCHOR: reviews
 * PURPOSE: GET /api/listings/[id]/reviews — paginated public reviews.
 * Dependencies: reviews.repository getListingReviews.
 *
 * DO:
 * - Mask author as first name + last initial
 * DONT:
 * - Return user email
 */

import { NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, _context: RouteContext) {
  return NextResponse.json({ data: [], meta: { total: 0, page: 1 } });
}

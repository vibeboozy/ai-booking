/**
 * ANCHOR: search
 * PURPOSE: GET /api/listings/search — поиск listings с фильтрами.
 * Dependencies: parseSearchParams, search.repository searchListings.
 * CRITICAL: Response ListingPreview only (no description).
 *
 * DO:
 * - Return { data, meta: { total, page, hasMore } }
 * DONT:
 * - Unbounded findMany without pagination
 */

import { NextResponse } from 'next/server';

export async function GET(_request: Request) {
  return NextResponse.json({
    data: [],
    meta: { total: 0, page: 1, hasMore: false },
  });
}

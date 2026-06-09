/**
 * ANCHOR: search
 * PURPOSE: GET /api/locations/autocomplete — автокомплит городов/стран.
 * Dependencies: search.repository autocompleteLocations, Zod (q min 2 chars).
 * CRITICAL: Rate limit 60 req/min per IP.
 *
 * DO:
 * - Return { data: Location[] }
 * DONT:
 * - Return full Location table without query filter
 */

import { NextResponse } from 'next/server';

export async function GET(_request: Request) {
  return NextResponse.json({ data: [] });
}

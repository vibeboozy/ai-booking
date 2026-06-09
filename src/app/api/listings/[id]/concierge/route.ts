/**
 * ANCHOR: listing
 * PURPOSE: POST /api/listings/[id]/concierge — ИИ-Консьерж streaming.
 * Dependencies: @/lib/ai, listing.repository (fetch context server-side), @/shared/constants/ai.
 * CRITICAL: Listing context from DB only; prompt injection defense; maxTokens 500.
 *
 * DO:
 * - streamText response
 * - Rate limit 20 req/min per user/IP
 * DONT:
 * - Accept description/amenities from request body
 */

import { NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, _context: RouteContext) {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}

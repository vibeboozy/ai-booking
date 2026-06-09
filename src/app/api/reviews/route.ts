/**
 * ANCHOR: reviews
 * PURPOSE: POST /api/reviews — создание отзыва.
 * Dependencies: @/lib/auth, submitReview action, reviews.repository.
 * CRITICAL: completed booking, unique bookingId, ownership, rating 1-5.
 *
 * DO:
 * - Return 201 { data: ReviewPublic }
 * DONT:
 * - Allow review on pending/upcoming booking
 */

import { NextResponse } from 'next/server';

export async function POST(_request: Request) {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}

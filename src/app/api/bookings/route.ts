/**
 * ANCHOR: booking
 * PURPOSE: POST /api/bookings — создание бронирования (status PENDING).
 * Dependencies: @/lib/auth, createBooking action/repository, Zod.
 * CRITICAL: Auth required; server-side price recalc; overlap check.
 *
 * DO:
 * - Return 201 { data: Booking }
 * DONT:
 * - Trust client totalPrice
 */

import { NextResponse } from 'next/server';

export async function POST(_request: Request) {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}

/**
 * ANCHOR: booking
 * PURPOSE: POST /api/bookings/mock-pay — имитация оплаты → CONFIRMED.
 * Dependencies: @/lib/auth, booking.repository confirmBookingPayment.
 * CRITICAL: Auth + ownership; disable in production without PAYMENT_PROVIDER=mock.
 *
 * DO:
 * - Return { data: { bookingId, status: 'confirmed' } }
 * DONT:
 * - Accept card numbers or payment credentials
 */

import { NextResponse } from 'next/server';

export async function POST(_request: Request) {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}

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
import { auth } from '@/lib/auth';
import { confirmBookingPayment } from '@/modules/booking/booking.repository';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId required' },
        { status: 400 },
      );
    }

    const booking = await confirmBookingPayment(bookingId, userId);

    return NextResponse.json({
      data: { bookingId: booking.id, status: 'confirmed' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

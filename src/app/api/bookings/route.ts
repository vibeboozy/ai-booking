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
import { auth } from '@/lib/auth';
import { createBookingRecord } from '@/modules/booking/booking.repository';
import type { BookingCreateInput } from '@/modules/booking/types';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const input: BookingCreateInput = {
      listingId: body.listingId,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guests: body.guests,
    };

    const booking = await createBookingRecord(userId, input);
    return NextResponse.json({ data: booking }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

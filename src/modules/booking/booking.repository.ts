/**
 * ANCHOR: booking
 * PURPOSE: Prisma-запросы: createBooking, check overlap, mock-pay status update.
 * Dependencies: @/lib/prisma, calculateTotalPrice.
 * CRITICAL: $transaction с overlap check; server-side totalPrice recalc.
 *
 * DO:
 * - Reject overlapping CONFIRMED|PENDING bookings
 * DONT:
 * - Trust client-sent totalPrice
 */

import type { Booking, BookingCreateInput } from '@/modules/booking/types';

export async function createBookingRecord(
  _userId: string,
  _input: BookingCreateInput,
): Promise<Booking> {
  throw new Error('Not implemented');
}

export async function confirmBookingPayment(_bookingId: string, _userId: string): Promise<Booking> {
  throw new Error('Not implemented');
}

/**
 * ANCHOR: booking
 * PURPOSE: Server Action — создание Booking (status PENDING).
 * Dependencies: @/lib/auth, booking.repository, Zod validation.
 * CRITICAL: Auth required; validate date overlap.
 */

'use server';

import type { BookingCreateInput } from '@/modules/booking/types';

export async function createBooking(
  _input: BookingCreateInput,
): Promise<{ data?: unknown; error?: string }> {
  return { error: 'Not implemented' };
}

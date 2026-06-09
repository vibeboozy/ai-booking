/**
 * ANCHOR: booking
 * PURPOSE: Server Action — расчёт PriceBreakdown для checkout preview.
 * Dependencies: calculateTotalPrice, listing.repository.
 */

'use server';

import type { PriceBreakdown } from '@/modules/booking/types';

export async function calculatePrice(_input: {
  listingId: string;
  checkIn: string;
  checkOut: string;
}): Promise<PriceBreakdown | null> {
  return null;
}

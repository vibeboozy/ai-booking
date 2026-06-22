/**
 * ANCHOR: booking
 * PURPOSE: Server Action — расчёт PriceBreakdown для checkout preview.
 * Dependencies: calculateTotalPrice, listing.repository.
 */

'use server';

import { getListingById } from '@/modules/listing/listing.repository';
import { calculateTotalPrice } from '@/modules/booking/utils/calculateTotalPrice';
import type { PriceBreakdown } from '@/modules/booking/types';

export async function calculatePrice(input: {
  listingId: string;
  checkIn: string;
  checkOut: string;
}): Promise<PriceBreakdown | null> {
  const listing = await getListingById(input.listingId);
  if (!listing) return null;

  const checkInDate = new Date(input.checkIn);
  const checkOutDate = new Date(input.checkOut);

  return calculateTotalPrice(listing, checkInDate, checkOutDate);
}

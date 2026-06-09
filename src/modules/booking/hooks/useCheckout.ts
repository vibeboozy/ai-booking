/**
 * ANCHOR: booking
 * PURPOSE: Hook состояния checkout: dates, guests, price breakdown, submit flow.
 * Dependencies: calculatePrice action, createBooking action.
 *
 * DO:
 * - Recalculate price on date/guest change
 * DONT:
 * - Local price calculation bypassing calculateTotalPrice
 */

'use client';

import type { PriceBreakdown } from '@/modules/booking/types';

export function useCheckout(_listingId: string): {
  breakdown: PriceBreakdown | null;
  isSubmitting: boolean;
  submit: () => Promise<void>;
} {
  return { breakdown: null, isSubmitting: false, submit: async () => {} };
}

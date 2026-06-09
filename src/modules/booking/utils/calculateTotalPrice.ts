/**
 * ANCHOR: booking
 * PURPOSE: Единственный источник расчёта цены (PriceBreakdown).
 * Dependencies: @/modules/listing/types (fee fields).
 * CRITICAL: SINGLE SOURCE OF TRUTH — UI и API MUST вызывать эту функцию.
 *
 * DO:
 * - Integer math (копейки)
 * - Throw/return error if checkOut <= checkIn
 * DONT:
 * - Дублировать формулы в CheckoutForm или API routes
 */

import type { PriceBreakdown } from '@/modules/booking/types';

type ListingFees = {
  pricePerNight: number;
  cleaningFee: number;
  serviceFee: number;
};

export function calculateTotalPrice(
  _listing: ListingFees,
  _checkIn: Date,
  _checkOut: Date,
): PriceBreakdown {
  return { nights: 0, subtotal: 0, cleaningFee: 0, serviceFee: 0, total: 0 };
}

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
  listing: ListingFees,
  checkIn: Date,
  checkOut: Date,
): PriceBreakdown {
  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (nights <= 0) {
    return { nights: 0, subtotal: 0, cleaningFee: 0, serviceFee: 0, total: 0 };
  }

  const subtotal = listing.pricePerNight * nights;
  const cleaningFee = listing.cleaningFee;
  const serviceFee = listing.serviceFee;
  const total = subtotal + cleaningFee + serviceFee;

  return { nights, subtotal, cleaningFee, serviceFee, total };
}

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

import { prisma } from '@/lib/prisma';
import type { Booking, BookingCreateInput } from '@/modules/booking/types';
import { getListingById } from '@/modules/listing/listing.repository';
import { calculateTotalPrice } from '@/modules/booking/utils/calculateTotalPrice';

export async function createBookingRecord(
  userId: string,
  input: BookingCreateInput,
): Promise<Booking> {
  const checkIn = new Date(input.checkIn);
  const checkOut = new Date(input.checkOut);

  const listing = await getListingById(input.listingId);
  if (!listing) {
    throw new Error('Listing not found');
  }

  const priceBreakdown = calculateTotalPrice(listing, checkIn, checkOut);
  if (priceBreakdown.nights <= 0) {
    throw new Error('Invalid dates');
  }

  const overlap = await prisma.booking.findFirst({
    where: {
      listingId: input.listingId,
      status: { in: ['CONFIRMED', 'PENDING'] },
      OR: [
        { checkIn: { lt: checkOut }, checkOut: { gt: checkIn } },
      ],
    },
  });

  if (overlap) {
    throw new Error('Dates are not available');
  }

  const booking = await prisma.booking.create({
    data: {
      userId,
      listingId: input.listingId,
      checkIn,
      checkOut,
      guests: input.guests,
      totalPrice: priceBreakdown.total,
      status: 'PENDING',
    },
  });

  return {
    id: booking.id,
    userId: booking.userId,
    listingId: booking.listingId,
    checkIn: booking.checkIn.toISOString(),
    checkOut: booking.checkOut.toISOString(),
    guests: booking.guests,
    totalPrice: booking.totalPrice,
    status: 'pending',
    createdAt: booking.createdAt.toISOString(),
  };
}

export async function confirmBookingPayment(
  bookingId: string,
  userId: string,
): Promise<Booking> {
  const booking = await prisma.booking.update({
    where: { id: bookingId, userId },
    data: { status: 'CONFIRMED' },
  });

  return {
    id: booking.id,
    userId: booking.userId,
    listingId: booking.listingId,
    checkIn: booking.checkIn.toISOString(),
    checkOut: booking.checkOut.toISOString(),
    guests: booking.guests,
    totalPrice: booking.totalPrice,
    status: 'confirmed',
    createdAt: booking.createdAt.toISOString(),
  };
}

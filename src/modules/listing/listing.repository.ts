/**
 * ANCHOR: listing
 * PURPOSE: Prisma-запросы: getListingById, getAvailability (из Booking dates).
 * Dependencies: @/lib/prisma, @/modules/listing/types.
 * CRITICAL: Availability из Booking status CONFIRMED|PENDING overlap check.
 *
 * DO:
 * - include host relation для ListingDetail
 * DONT:
 * - Отдельная таблица AvailabilityBlock
 */

import { prisma } from '@/lib/prisma';
import type { AvailabilityDay, ListingDetail } from '@/modules/listing/types';

export async function getListingById(
  id: string,
): Promise<ListingDetail | null> {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!listing) return null;

  const propertyTypeMap: Record<string, 'apartment' | 'house' | 'room'> = {
    APARTMENT: 'apartment',
    HOUSE: 'house',
    ROOM: 'room',
  };

  return {
    id: listing.id,
    title: listing.title,
    city: listing.city,
    country: listing.country,
    pricePerNight: listing.pricePerNight,
    images: listing.images,
    averageRating: listing.averageRating,
    reviewCount: listing.reviewCount,
    propertyType: propertyTypeMap[listing.propertyType] ?? 'apartment',
    description: listing.description,
    amenities: listing.amenities,
    lat: listing.lat,
    lng: listing.lng,
    cleaningFee: listing.cleaningFee,
    serviceFee: listing.serviceFee,
    host: listing.host,
  };
}

export async function getAvailability(
  listingId: string,
  month?: string,
): Promise<AvailabilityDay[]> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const startDate = month
    ? new Date(`${month}-01`)
    : new Date(today.getFullYear(), today.getMonth(), 1);

  const endOfMonth = new Date(
    startDate.getFullYear(),
    startDate.getMonth() + 1,
    0,
  );
  const endDate = month
    ? endOfMonth
    : new Date(today.getFullYear(), today.getMonth() + 3, 0);

  const bookings = await prisma.booking.findMany({
    where: {
      listingId,
      status: { in: ['CONFIRMED', 'PENDING'] },
      OR: [
        {
          checkIn: { lte: endDate },
          checkOut: { gte: startDate },
        },
      ],
    },
    select: {
      checkIn: true,
      checkOut: true,
    },
  });

  const bookedDates = new Set<string>();
  for (const booking of bookings) {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const current = new Date(Math.max(checkIn.getTime(), startDate.getTime()));
    const end = new Date(Math.min(checkOut.getTime(), endDate.getTime()));

    while (current <= end) {
      if (current >= today) {
        bookedDates.add(current.toISOString().split('T')[0]);
      }
      current.setDate(current.getDate() + 1);
    }
  }

  const result: AvailabilityDay[] = [];
  const current = new Date(Math.max(startDate.getTime(), today.getTime()));
  const end = endDate;

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    let status: 'free' | 'booked' | 'past' = 'free';

    if (current < today) {
      status = 'past';
    } else if (bookedDates.has(dateStr)) {
      status = 'booked';
    }

    result.push({ date: dateStr, status });
    current.setDate(current.getDate() + 1);
  }

  return result;
}

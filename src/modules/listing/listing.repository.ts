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

import type { AvailabilityDay, ListingDetail } from '@/modules/listing/types';

export async function getListingById(
  _id: string,
): Promise<ListingDetail | null> {
  return null;
}

export async function getAvailability(
  _listingId: string,
  _month?: string,
): Promise<AvailabilityDay[]> {
  return [];
}

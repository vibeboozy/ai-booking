/**
 * ANCHOR: reviews
 * PURPOSE: Server-side пересчёт averageRating/reviewCount на Listing.
 * Dependencies: calculateAverageRating, @/lib/prisma.
 */

'use server';

export async function aggregateRating(_listingId: string): Promise<void> {
  // TODO: implement
}

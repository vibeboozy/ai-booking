/**
 * ANCHOR: reviews
 * PURPOSE: Server-side пересчёт averageRating/reviewCount на Listing.
 * Dependencies: calculateAverageRating, @/lib/prisma.
 */

'use server';

import { prisma } from '@/lib/prisma';
import { calculateAverageRating } from '@/modules/reviews/utils/calculateAverageRating';

export async function aggregateRating(listingId: string): Promise<void> {
  const reviews = await prisma.review.findMany({
    where: { listingId },
    select: { rating: true },
  });

  const ratings = reviews.map((r) => r.rating);
  const averageRating = calculateAverageRating(ratings);
  const reviewCount = reviews.length;

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      averageRating,
      reviewCount,
    },
  });
}

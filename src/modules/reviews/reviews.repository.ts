/**
 * ANCHOR: reviews
 * PURPOSE: Prisma-запросы: createReview, listReviews, update Listing.averageRating.
 * Dependencies: @/lib/prisma, calculateAverageRating.
 * CRITICAL: booking.status === COMPLETED; bookingId @unique; ownership check.
 *
 * DO:
 * - $transaction: create Review + update Listing denormalized fields
 * DONT:
 * - Allow duplicate review per booking
 */

import type { ReviewInput, ReviewPublic } from '@/modules/reviews/types';

export async function createReview(
  _userId: string,
  _input: ReviewInput,
): Promise<ReviewPublic> {
  throw new Error('Not implemented');
}

export async function getListingReviews(
  _listingId: string,
  _page?: number,
): Promise<{ data: ReviewPublic[]; meta: { total: number; page: number } }> {
  return { data: [], meta: { total: 0, page: 1 } };
}

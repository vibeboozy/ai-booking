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

import { prisma } from '@/lib/prisma';
import { calculateAverageRating } from '@/modules/reviews/utils/calculateAverageRating';
import type { ReviewInput, ReviewPublic } from '@/modules/reviews/types';

export async function createReview(
  userId: string,
  input: ReviewInput,
): Promise<ReviewPublic> {
  // Fetch booking with listing to validate ownership and status
  const booking = await prisma.booking.findUnique({
    where: { id: input.bookingId },
    include: { listing: true },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.userId !== userId) {
    throw new Error('Not authorized to review this booking');
  }

  if (booking.status !== 'COMPLETED') {
    throw new Error('Can only review completed bookings');
  }

  // Check if review already exists for this booking
  const existingReview = await prisma.review.findUnique({
    where: { bookingId: input.bookingId },
  });

  if (existingReview) {
    throw new Error('Review already exists for this booking');
  }

  // Validate rating
  if (input.rating < 1 || input.rating > 5) {
    throw new Error('Rating must be between 1 and 5');
  }

  // Create review and update listing rating in transaction
  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        userId,
        listingId: booking.listingId,
        bookingId: input.bookingId,
        rating: input.rating,
        text: input.text,
        photos: input.photos || [],
      },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Recalculate listing rating
    const allReviews = await tx.review.findMany({
      where: { listingId: booking.listingId },
      select: { rating: true },
    });

    const ratings = allReviews.map((r) => r.rating);
    const averageRating = calculateAverageRating(ratings);
    const reviewCount = allReviews.length;

    await tx.listing.update({
      where: { id: booking.listingId },
      data: {
        averageRating,
        reviewCount,
      },
    });

    return review;
  });

  return {
    id: result.id,
    rating: result.rating,
    text: result.text,
    photos: result.photos,
    author: {
      name: result.user.name,
      avatarUrl: result.user.avatarUrl ?? undefined,
    },
    createdAt: result.createdAt.toISOString(),
  };
}

export async function getListingReviews(
  listingId: string,
  page: number = 1,
): Promise<{ data: ReviewPublic[]; meta: { total: number; page: number } }> {
  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { listingId },
      include: {
        user: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.review.count({ where: { listingId } }),
  ]);

  return {
    data: reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      text: review.text,
      photos: review.photos,
      author: {
        name: review.user.name,
        avatarUrl: review.user.avatarUrl ?? undefined,
      },
      createdAt: review.createdAt.toISOString(),
    })),
    meta: { total, page },
  };
}

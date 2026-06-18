/**
 * ANCHOR: profile
 * PURPOSE: Server action для создания отзыва.
 * Dependencies: @/lib/auth, @/lib/prisma.
 * CRITICAL: Only completed booking without existing review.
 */

'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitReviewAction(input: {
  bookingId: string;
  rating: number;
  text: string;
  photos?: string[];
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: 'Требуется авторизация' };
  }

  const { bookingId, rating, text, photos } = input;

  // Validate rating
  if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
    return { success: false, error: 'Рейтинг должен быть от 1 до 5' };
  }

  // Validate text
  if (!text.trim() || text.trim().length < 10) {
    return { success: false, error: 'Отзыв должен содержать минимум 10 символов' };
  }

  try {
    // Check booking exists, belongs to user, is completed, and has no review
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true, listing: true },
    });

    if (!booking) {
      return { success: false, error: 'Бронирование не найдено' };
    }

    if (booking.userId !== session.user.id) {
      return { success: false, error: 'Нет доступа к этому бронированию' };
    }

    if (booking.status !== 'COMPLETED') {
      return { success: false, error: 'Отзыв можно оставить только для завершённого бронирования' };
    }

    if (booking.review) {
      return { success: false, error: 'Отзыв уже существует' };
    }

    // Create review and update listing rating in transaction
    await prisma.$transaction([
      prisma.review.create({
        data: {
          userId: session.user.id,
          listingId: booking.listingId,
          bookingId,
          rating,
          text: text.trim(),
          photos: photos || [],
        },
      }),
      // Update listing aggregate
      prisma.listing.update({
        where: { id: booking.listingId },
        data: {
          reviewCount: { increment: 1 },
          averageRating: {
            set: ((booking.listing.averageRating * booking.listing.reviewCount) + rating) / (booking.listing.reviewCount + 1),
          },
        },
      }),
    ]);

    // Revalidate listing and profile pages
    revalidatePath(`/listings/${booking.listingId}`);
    revalidatePath('/profile/trips');

    return { success: true };
  } catch (error) {
    console.error('[submitReviewAction]', error);
    return { success: false, error: 'Ошибка при сохранении отзыва' };
  }
}
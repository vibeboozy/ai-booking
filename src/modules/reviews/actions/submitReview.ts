/**
 * ANCHOR: reviews
 * PURPOSE: Server Action — submit review + aggregate rating.
 * Dependencies: reviews.repository, Zod validation, @/lib/auth.
 * CRITICAL: Eligibility: completed booking, no existing review, owner match.
 */

'use server';

import { z } from 'zod';
import { auth } from '@/lib/auth';
import { createReview } from '@/modules/reviews/reviews.repository';
import type { ReviewInput } from '@/modules/reviews/types';

const reviewInputSchema = z.object({
  bookingId: z.string().min(1, 'bookingId обязателен'),
  rating: z.number().int().min(1).max(5, 'Рейтинг должен быть от 1 до 5'),
  text: z
    .string()
    .min(1, 'Текст отзыва обязателен')
    .max(5000, 'Отзыв слишком длинный'),
  photos: z.array(z.string().url()).optional(),
});

export async function submitReview(
  input: ReviewInput,
): Promise<{ data?: unknown; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Требуется авторизация' };
  }

  const parsed = reviewInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Неверные данные' };
  }

  try {
    const review = await createReview(session.user.id, parsed.data);
    return { data: review };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Ошибка при создании отзыва';
    return { error: message };
  }
}

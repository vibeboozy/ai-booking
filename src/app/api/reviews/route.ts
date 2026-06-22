/**
 * ANCHOR: reviews
 * PURPOSE: POST /api/reviews — создание отзыва.
 * Dependencies: @/lib/auth, submitReview action, reviews.repository.
 * CRITICAL: completed booking, unique bookingId, ownership, rating 1-5.
 *
 * DO:
 * - Return 201 { data: ReviewPublic }
 * DONT:
 * - Allow review on pending/upcoming booking
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { submitReview } from '@/modules/reviews/actions/submitReview';

const reviewSchema = z.object({
  bookingId: z.string().min(1, 'bookingId обязателен'),
  rating: z.number().int().min(1).max(5, 'Рейтинг должен быть от 1 до 5'),
  text: z.string().min(1, 'Текст отзыва обязателен').max(5000, 'Отзыв слишком длинный'),
  photos: z.array(z.string().url()).optional(),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Неверный JSON' }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || 'Неверные данные' },
      { status: 400 },
    );
  }

  const result = await submitReview(parsed.data);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ data: result.data }, { status: 201 });
}

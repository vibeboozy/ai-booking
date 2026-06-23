/**
 * ANCHOR: reviews
 * PURPOSE: Server Action — delete review + aggregate rating.
 * Dependencies: reviews.repository, @/lib/auth.
 * CRITICAL: ownership check; update Listing.averageRating on delete.
 */

'use server';

import { auth } from '@/lib/auth';
import { deleteReview } from '@/modules/reviews/reviews.repository';

export async function removeReview(
  reviewId: string,
): Promise<{ data?: unknown; error?: string }> {
  const session = await auth();

  if (!session?.user?.id) {
    return { error: 'Требуется авторизация' };
  }

  try {
    await deleteReview(session.user.id, reviewId);
    return { data: { deleted: true } };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Ошибка при удалении отзыва';
    return { error: message };
  }
}

/**
 * ANCHOR: reviews
 * PURPOSE: DELETE /api/reviews/[id] — удаление отзыва.
 * Dependencies: @/lib/auth, deleteReview repository function.
 * CRITICAL: ownership check; update Listing.averageRating on delete.
 *
 * DO:
 * - Return 200 { data: { deleted: true } }
 * - Recalculate listing rating after delete
 * DONT:
 * - Allow non-owner to delete review
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteReview } from '@/modules/reviews/reviews.repository';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteReview(session.user.id, id);
    return NextResponse.json({ data: { deleted: true } }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ошибка при удалении отзыва';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
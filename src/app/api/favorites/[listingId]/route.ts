/**
 * ANCHOR: profile
 * PURPOSE: DELETE /api/favorites/[listingId] — удалить из избранного.
 * Dependencies: @/lib/auth, profile.repository removeFavorite.
 * CRITICAL: Auth required; ownership check via session userId.
 *
 * DO:
 * - Return 200 { data: { success: true } }
 * - Idempotent: no error if not favorited
 * DONT:
 * - Return 404 if not favorited (security: don't reveal existence)
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { removeFavorite } from '@/modules/profile/profile.repository';

type RouteContext = { params: Promise<{ listingId: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Требуется авторизация' },
      { status: 401 },
    );
  }

  const { listingId } = await context.params;

  if (!listingId || typeof listingId !== 'string') {
    return NextResponse.json({ error: 'Неверный listingId' }, { status: 400 });
  }

  try {
    await removeFavorite(session.user.id, listingId);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('[DELETE /api/favorites/[listingId]]', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении из избранного' },
      { status: 500 },
    );
  }
}

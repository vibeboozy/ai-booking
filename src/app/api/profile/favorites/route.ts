/**
 * ANCHOR: profile
 * PURPOSE: GET /api/profile/favorites — ListingPreview[] избранного.
 * Dependencies: @/lib/auth, profile.repository getUserFavorites.
 * CRITICAL: Auth required.
 *
 * DO:
 * - Return { data: ListingPreview[] }
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserFavorites } from '@/modules/profile/profile.repository';

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Требуется авторизация' },
      { status: 401 },
    );
  }

  try {
    const favorites = await getUserFavorites(session.user.id);

    return NextResponse.json({ data: favorites });
  } catch (error) {
    console.error('[GET /api/profile/favorites]', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке избранного' },
      { status: 500 },
    );
  }
}
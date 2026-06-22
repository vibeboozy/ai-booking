/**
 * ANCHOR: profile
 * PURPOSE: POST /api/favorites — добавить в избранное.
 * Dependencies: @/lib/auth, profile.repository addFavorite, addFavoriteSchema.
 * CRITICAL: Auth required; unique (userId, listingId).
 *
 * DO:
 * - Return 201 { data: Favorite }
 * - Idempotent: return existing if already favorited
 * DONT:
 * - Allow duplicate favorites without handling
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { addFavorite } from '@/modules/profile/profile.repository';
import { addFavoriteSchema } from '@/modules/profile/schemas/profile';

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Требуется авторизация' },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Неверный JSON в теле запроса' },
      { status: 400 },
    );
  }

  const parseResult = addFavoriteSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: 'Неверные данные', details: parseResult.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const favorite = await addFavorite(
      session.user.id,
      parseResult.data.listingId,
    );

    return NextResponse.json({ data: favorite }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/favorites]', error);
    return NextResponse.json(
      { error: 'Ошибка при добавлении в избранное' },
      { status: 500 },
    );
  }
}

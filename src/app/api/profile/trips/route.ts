/**
 * ANCHOR: profile
 * PURPOSE: GET /api/profile/trips — список поездок пользователя.
 * Dependencies: @/lib/auth, profile.repository getUserTrips, tripsQuerySchema.
 * CRITICAL: Auth required; filter by session userId only.
 *
 * DO:
 * - Query status?: upcoming|history
 * - Return { data: Trip[] }
 * DONT:
 * - Accept userId from query string
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserTrips } from '@/modules/profile/profile.repository';
import { tripsQuerySchema } from '@/modules/profile/schemas/profile';

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Требуется авторизация' },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const queryResult = tripsQuerySchema.safeParse({
    status: searchParams.get('status') || undefined,
  });

  if (!queryResult.success) {
    return NextResponse.json(
      { error: 'Неверные параметры запроса', details: queryResult.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const trips = await getUserTrips(
      session.user.id,
      queryResult.data.status,
    );

    return NextResponse.json({ data: trips });
  } catch (error) {
    console.error('[GET /api/profile/trips]', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке поездок' },
      { status: 500 },
    );
  }
}
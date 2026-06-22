/**
 * ANCHOR: profile
 * PURPOSE: Route /profile — hub личного кабинета с навигацией.
 * Dependencies: @/lib/auth, TripsList, FavoritesList.
 * CRITICAL: Auth required; redirect if not logged in.
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/profile');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* User info */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-white">
            {session.user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{session.user.name}</h1>
            <p className="text-gray-500">{session.user.email}</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/profile/trips"
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-3xl">✈️</span>
            <div>
              <h2 className="font-semibold">Мои поездки</h2>
              <p className="text-sm text-gray-500">
                Предстоящие и прошедшие бронирования
              </p>
            </div>
          </Link>

          <Link
            href="/profile/favorites"
            className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <span className="text-3xl">❤️</span>
            <div>
              <h2 className="font-semibold">Избранное</h2>
              <p className="text-sm text-gray-500">Сохранённые места</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}

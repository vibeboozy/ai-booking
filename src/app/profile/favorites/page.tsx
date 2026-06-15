/**
 * ANCHOR: profile
 * PURPOSE: Route /profile/favorites — сохранённые места.
 * Dependencies: FavoritesList, @/lib/auth, getUserFavorites (cached).
 * CRITICAL: Auth required.
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getUserFavorites } from '@/modules/profile/profile.repository';
import { FavoritesList } from '@/modules/profile';

export default async function ProfileFavoritesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/profile/favorites');
  }

  // Prefetch favorites on server (cached with React.cache)
  const favorites = await getUserFavorites(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/profile" className="hover:text-gray-700 dark:hover:text-gray-300">
            Профиль
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-200">Избранное</span>
        </nav>

        <h1 className="mb-6 text-2xl font-bold">Избранное</h1>

        <FavoritesList initialFavorites={favorites} />
      </main>
    </div>
  );
}
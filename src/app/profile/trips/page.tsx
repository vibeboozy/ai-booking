/**
 * ANCHOR: profile
 * PURPOSE: Route /profile/trips — upcoming и history поездок.
 * Dependencies: TripsList, @/lib/auth, getUserTrips (server prefetch).
 * CRITICAL: Auth required; canReview links to review form.
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { getAllUserTrips } from '@/modules/profile/profile.repository';
import { TripsList } from '@/modules/profile';
import { URL } from '@/shared/constants/urls';

type ProfileTripsPageProps = {
  searchParams: Promise<{ status?: string; success?: string }>;
};

export default async function ProfileTripsPage({
  searchParams,
}: ProfileTripsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect(`${URL.LOGIN}?callbackUrl=${URL.PROFILE_TRIPS}`);
  }

  const params = await searchParams;
  const initialStatus = params.status === 'history' ? 'history' : 'upcoming';
  const showSuccess = params.success === 'true';

  // Prefetch all trips on server (single query)
  const { upcoming: upcomingTrips, history: historyTrips } =
    await getAllUserTrips(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
          <Link href={URL.PROFILE} className="hover:text-gray-700">
            Профиль
          </Link>
          <span>/</span>
          <span className="text-gray-900">Мои поездки</span>
        </nav>

        {/* Success message */}
        {showSuccess && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
            <p className="font-medium">Бронирование подтверждено!</p>
            <p className="mt-1 text-sm">Приятной поездки!</p>
          </div>
        )}

        <h1 className="mb-6 text-2xl font-bold">Мои поездки</h1>

        <TripsList
          initialStatus={initialStatus}
          initialUpcomingTrips={upcomingTrips}
          initialHistoryTrips={historyTrips}
        />
      </main>
    </div>
  );
}

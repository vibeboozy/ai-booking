/**
 * ANCHOR: reviews
 * PURPOSE: Route /profile/trips/[bookingId]/review — форма отзыва.
 * Dependencies: ReviewForm, @/lib/auth, booking eligibility check.
 * CRITICAL: Only completed booking without existing review.
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ReviewForm } from '@/modules/reviews';

type ReviewPageProps = {
  params: Promise<{ bookingId: string }>;
};

export default async function ReviewPage({ params }: ReviewPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/profile/trips');
  }

  const { bookingId } = await params;

  // Fetch and validate booking
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: { select: { id: true, title: true } },
      review: { select: { id: true } },
    },
  });

  if (!booking) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h1 className="text-xl font-semibold text-red-800">
            Бронирование не найдено
          </h1>
          <Link
            href="/profile/trips"
            className="mt-4 inline-block text-primary hover:underline"
          >
            Вернуться к поездкам
          </Link>
        </div>
      </main>
    );
  }

  if (booking.userId !== session.user.id) {
    redirect('/profile/trips');
  }

  if (booking.status !== 'COMPLETED') {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
          <h1 className="text-xl font-semibold text-yellow-800">
            Отзыв можно оставить только для завершённого бронирования
          </h1>
          <Link
            href="/profile/trips"
            className="mt-4 inline-block text-primary hover:underline"
          >
            Вернуться к поездкам
          </Link>
        </div>
      </main>
    );
  }

  if (booking.review) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
          <h1 className="text-xl font-semibold text-yellow-800">
            Отзыв уже существует
          </h1>
          <Link
            href="/profile/trips?status=history"
            className="mt-4 inline-block text-primary hover:underline"
          >
            Вернуться к поездкам
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/profile" className="hover:text-gray-700">
          Профиль
        </Link>
        <span>/</span>
        <Link href="/profile/trips" className="hover:text-gray-700">
          Мои поездки
        </Link>
        <span>/</span>
        <span className="text-gray-900">Отзыв</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold">Оставить отзыв</h1>

      <ReviewForm bookingId={bookingId} listingTitle={booking.listing.title} />
    </main>
  );
}

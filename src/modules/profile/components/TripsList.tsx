/**
 * ANCHOR: profile
 * PURPOSE: Список поездок: upcoming / history tabs, cards with status badges.
 * Dependencies: useTrips, @/shared/utils/formatPrice.
 *
 * DO:
 * - Link «Оставить отзыв» when canReview
 * - «Отменить» for upcoming confirmed
 * - Proper date formatting
 * DONT:
 * - Show other users' bookings
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTrips } from '@/modules/profile/hooks/useTrips';
import { useCancelTrip } from '@/modules/profile/hooks/useCancelTrip';
import { formatPrice } from '@/shared/utils/formatPrice';
import { cn } from '@/shared/utils/cn';
import type { Trip } from '@/modules/profile/types';

type TripsListProps = {
  initialStatus?: 'upcoming' | 'history';
  initialUpcomingTrips?: Trip[];
  initialHistoryTrips?: Trip[];
};

const statusLabels: Record<Trip['booking']['status'], string> = {
  pending: 'Ожидает подтверждения',
  confirmed: 'Подтверждено',
  completed: 'Завершено',
  cancelled: 'Отменено',
};

const statusBadgeClasses: Record<Trip['booking']['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

function TripCard({ trip }: { trip: Trip }) {
  const { booking, listing, canReview } = trip;
  const { cancelTrip, isPending } = useCancelTrip();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const checkIn = new Date(booking.checkIn);
  const checkOut = new Date(booking.checkOut);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
  );

  const handleCancel = () => {
    if (showCancelConfirm) {
      cancelTrip(booking.id);
      setShowCancelConfirm(false);
    } else {
      setShowCancelConfirm(true);
    }
  };

  const handleCancelBlur = () => {
    setTimeout(() => setShowCancelConfirm(false), 200);
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:flex-row">
      {/* Image */}
      <div className="relative h-32 w-full overflow-hidden rounded-lg sm:h-40 sm:w-48">
        <Image
          src={listing.images[0] || '/placeholder.jpg'}
          alt={listing.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        <div className="mb-2 flex items-start justify-between gap-2">
          <div>
            <Link
              href={`/listings/${listing.id}`}
              className="text-lg font-semibold hover:text-primary"
            >
              {listing.title}
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {listing.city}, {listing.country}
            </p>
          </div>

          {/* Status badge */}
          <span
            className={cn(
              'rounded-full px-2 py-1 text-xs font-medium',
              statusBadgeClasses[booking.status],
            )}
          >
            {statusLabels[booking.status]}
          </span>
        </div>

        {/* Dates and guests */}
        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span>
            {formatDate(checkIn)} — {formatDate(checkOut)}
          </span>
          <span className="text-gray-500">
            {nights} {nights === 1 ? 'ночь' : nights < 5 ? 'ночи' : 'ночей'}
          </span>
          <span className="text-gray-500">{booking.guests} гостей</span>
        </div>

        {/* Price */}
        <div className="mt-2 flex items-center justify-between">
          <p className="font-semibold">
            {formatPrice(booking.totalPrice)}
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            {canReview && (
              <Link
                href={`/profile/trips/${booking.id}/review`}
                className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90"
              >
                Оставить отзыв
              </Link>
            )}
            {(booking.status === 'confirmed' || booking.status === 'pending') && (
              <div className="relative">
                <button
                  type="button"
                  onClick={handleCancel}
                  onBlur={handleCancelBlur}
                  disabled={isPending}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
                    showCancelConfirm
                      ? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-900/20'
                      : 'border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20',
                    isPending && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  {showCancelConfirm ? 'Подтвердить?' : 'Отменить'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ status }: { status: 'upcoming' | 'history' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 text-4xl">🗺️</div>
      <h3 className="text-lg font-semibold">
        {status === 'upcoming' ? 'Нет предстоящих поездок' : 'Нет завершённых поездок'}
      </h3>
      <p className="mt-1 text-gray-500 dark:text-gray-400">
        {status === 'upcoming'
          ? 'Забронируйте жильё и начните планирование!'
          : 'Ваши завершённые поездки появятся здесь'}
      </p>
      {status === 'upcoming' && (
        <Link
          href="/"
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          Найти жильё
        </Link>
      )}
    </div>
  );
}

export function TripsList({
  initialStatus = 'upcoming',
  initialUpcomingTrips,
  initialHistoryTrips,
}: TripsListProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>(initialStatus);

  // Get initial data for current tab
  const initialData = activeTab === 'upcoming' ? initialUpcomingTrips : initialHistoryTrips;
  const { trips, isLoading, error } = useTrips(activeTab, initialData);

  // Use initial data if available (from server prefetch), otherwise use hook's fetched data
  const displayTrips = initialData ?? trips;

  // Determine if we should show loading skeleton
  // Show loading if: hook is loading AND we don't have initial data for this tab
  const showLoading = isLoading && initialData === undefined;

  const tabs: { value: 'upcoming' | 'history'; label: string }[] = [
    { value: 'upcoming', label: 'Предстоящие' },
    { value: 'history', label: 'История' },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.value
                ? 'bg-white shadow-sm dark:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {showLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex gap-4">
                <div className="h-32 w-48 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="mt-4 h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && displayTrips.length === 0 && (
        <EmptyState status={activeTab} />
      )}

      {/* List */}
      {!isLoading && !error && displayTrips.length > 0 && (
        <div className="space-y-4">
          {displayTrips.map((trip) => (
            <TripCard key={trip.booking.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
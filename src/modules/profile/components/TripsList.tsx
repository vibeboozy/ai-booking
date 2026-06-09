/**
 * ANCHOR: profile
 * PURPOSE: Список поездок: upcoming / history tabs, cards with status badges.
 * Dependencies: useTrips, @/shared/utils/formatPrice.
 *
 * DO:
 * - Link «Оставить отзыв» when canReview
 * - «Отменить» for upcoming confirmed
 * DONT:
 * - Show other users' bookings
 */

'use client';

type TripsListProps = {
  status?: 'upcoming' | 'history';
};

export function TripsList(_props: TripsListProps) {
  return null;
}

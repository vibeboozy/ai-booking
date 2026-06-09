/**
 * ANCHOR: listing
 * PURPOSE: Календарь доступности: free/booked/past dates.
 * Dependencies: useAvailability, GET /api/listings/[id]/availability.
 * CRITICAL: Exported для booking/checkout; props contract stable (see anchor_standards.xml).
 *
 * DO:
 * - mode: 'view' | 'select' для listing vs checkout
 * - onDateSelect callback в select mode
 * DONT:
 * - Менять props interface без согласования Dev C
 */

'use client';

type AvailabilityCalendarProps = {
  listingId: string;
  selectedCheckIn?: Date;
  selectedCheckOut?: Date;
  onDateSelect?: (checkIn: Date, checkOut: Date) => void;
  mode?: 'view' | 'select';
};

export function AvailabilityCalendar(_props: AvailabilityCalendarProps) {
  return null;
}

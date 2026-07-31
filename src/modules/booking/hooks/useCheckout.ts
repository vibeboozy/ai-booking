/**
 * ANCHOR: booking
 * PURPOSE: Hook состояния checkout: dates, guests, price breakdown, submit flow.
 * Dependencies: calculatePrice action, createBooking action.
 *
 * DO:
 * - Recalculate price on date/guest change
 * DONT:
 * - Local price calculation bypassing calculateTotalPrice
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import type { ListingDetail } from '@/modules/listing/types';
import type { PriceBreakdown } from '@/modules/booking/types';
import type { AvailabilityDay } from '@/modules/listing/types';
import { calculateTotalPrice } from '@/modules/booking/utils/calculateTotalPrice';
import { toLocalDateString, parseLocalDate } from '@/shared/utils/date';
import { API } from '@/shared/constants/urls';

export function useCheckout(
  listing: ListingDetail,
  availabilityDays: AvailabilityDay[] = [],
): {
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
  breakdown: PriceBreakdown | null;
  isSubmitting: boolean;
  pendingCheckIn: Date | null;
  validationError: string | null;
  setGuests: (guests: number) => void;
  onDateClick: (date: Date) => void;
  clearDates: () => void;
  submit: () => Promise<string | null>;
} {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingCheckIn, setPendingCheckIn] = useState<Date | null>(null);

  const checkIn = parseLocalDate(searchParams.get('checkIn') ?? undefined);
  const checkOut = parseLocalDate(searchParams.get('checkOut') ?? undefined);
  const rawGuests = parseInt(searchParams.get('guests') ?? '1', 10);
  const guests =
    isNaN(rawGuests) || rawGuests < 1 ? 1 : Math.min(rawGuests, 10);

  const validationError = useMemo(() => {
    if (rawGuests > 10) {
      return 'Максимальное количество гостей — 10';
    }

    if (!checkIn || !checkOut) return null;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (checkIn < today || checkOut < today) {
      return 'Выбранные даты уже прошли';
    }

    if (checkOut <= checkIn) {
      return 'Дата выезда должна быть позже даты заезда';
    }

    const bookedDates = new Set(
      availabilityDays.filter((d) => d.status === 'booked').map((d) => d.date),
    );

    const checkInStr = toLocalDateString(checkIn);
    const checkOutStr = toLocalDateString(checkOut);

    if (bookedDates.has(checkInStr) || bookedDates.has(checkOutStr)) {
      return 'Выбранные даты недоступны для бронирования';
    }

    return null;
  }, [rawGuests, checkIn, checkOut, availabilityDays]);

  const breakdown = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    return calculateTotalPrice(listing, checkIn, checkOut);
  }, [listing, checkIn, checkOut]);

  const onDateClick = useCallback(
    (date: Date) => {
      const params = new URLSearchParams(searchParams.toString());

      if (!pendingCheckIn) {
        setPendingCheckIn(date);
        params.set('checkIn', toLocalDateString(date));
        params.delete('checkOut');
      } else {
        if (date <= pendingCheckIn) {
          setPendingCheckIn(date);
          params.set('checkIn', toLocalDateString(date));
          params.delete('checkOut');
        } else {
          setPendingCheckIn(null);
          params.set('checkIn', toLocalDateString(pendingCheckIn));
          params.set('checkOut', toLocalDateString(date));
        }
      }

      window.history.pushState(null, '', `?${params.toString()}`);
    },
    [pendingCheckIn, searchParams],
  );

  const clearDates = useCallback(() => {
    setPendingCheckIn(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('checkIn');
    params.delete('checkOut');
    window.history.pushState(null, '', `?${params.toString()}`);
  }, [searchParams]);

  const setGuests = useCallback(
    (newGuests: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('guests', String(newGuests));
      window.history.pushState(null, '', `?${params.toString()}`);
    },
    [searchParams],
  );

  const submit = useCallback(async (): Promise<string | null> => {
    if (validationError) return null;
    if (!checkIn || !checkOut || !breakdown || breakdown.nights <= 0)
      return null;

    setIsSubmitting(true);
    try {
      const res = await fetch(API.BOOKINGS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          checkIn: toLocalDateString(checkIn),
          checkOut: toLocalDateString(checkOut),
          guests,
        }),
      });

      if (!res.ok) return null;
      const { data } = await res.json();
      return data.id as string;
    } catch {
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [validationError, checkIn, checkOut, guests, listing.id, breakdown]);

  return {
    checkIn,
    checkOut,
    guests,
    breakdown,
    isSubmitting,
    pendingCheckIn,
    validationError,
    setGuests,
    onDateClick,
    clearDates,
    submit,
  };
}

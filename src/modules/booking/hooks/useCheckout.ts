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
import { calculateTotalPrice } from '@/modules/booking/utils/calculateTotalPrice';

export function useCheckout(listing: ListingDetail): {
  checkIn: Date | null;
  checkOut: Date | null;
  guests: number;
  breakdown: PriceBreakdown | null;
  isSubmitting: boolean;
  pendingCheckIn: Date | null;
  setGuests: (guests: number) => void;
  onDateClick: (date: Date) => void;
  clearDates: () => void;
  submit: () => Promise<string | null>;
} {
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingCheckIn, setPendingCheckIn] = useState<Date | null>(null);

  const parseDate = (param: string | string[] | undefined): Date | null => {
    if (!param || Array.isArray(param)) return null;
    const date = new Date(param);
    return isNaN(date.getTime()) ? null : date;
  };

  const checkIn = parseDate(searchParams.get('checkIn'));
  const checkOut = parseDate(searchParams.get('checkOut'));
  const guests = parseInt(searchParams.get('guests') ?? '1', 10);

  const breakdown = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    return calculateTotalPrice(listing, checkIn, checkOut);
  }, [listing, checkIn, checkOut]);

  const onDateClick = useCallback(
    (date: Date) => {
      const params = new URLSearchParams(searchParams.toString());

      if (!pendingCheckIn) {
        setPendingCheckIn(date);
        params.set('checkIn', date.toISOString().split('T')[0]);
        params.delete('checkOut');
      } else {
        if (date <= pendingCheckIn) {
          setPendingCheckIn(date);
          params.set('checkIn', date.toISOString().split('T')[0]);
          params.delete('checkOut');
        } else {
          setPendingCheckIn(null);
          params.set('checkIn', pendingCheckIn.toISOString().split('T')[0]);
          params.set('checkOut', date.toISOString().split('T')[0]);
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
    if (!checkIn || !checkOut || !breakdown) return null;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
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
  }, [checkIn, checkOut, guests, listing.id, breakdown]);

  return {
    checkIn,
    checkOut,
    guests,
    breakdown,
    isSubmitting,
    pendingCheckIn,
    setGuests,
    onDateClick,
    clearDates,
    submit,
  };
}

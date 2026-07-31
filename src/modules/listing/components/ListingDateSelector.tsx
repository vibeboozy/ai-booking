/**
 * ANCHOR: listing
 * PURPOSE: Client-обёртка для выбора дат на странице listing + кнопка бронирования.
 * Dependencies: AvailabilityCalendar, useRouter, useAvailability.
 *
 * DO:
 * - URL-driven state (searchParams)
 * - Validate URL dates against availability API
 * - Pass listingId, maxGuests в checkout
 * DONT:
 * - Не дублировать логику выбора дат из useCheckout
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { AvailabilityCalendar } from '@/modules/listing/components/AvailabilityCalendar';
import { useAvailability } from '@/modules/listing/hooks/useAvailability';
import { toLocalDateString, parseLocalDate } from '@/shared/utils/date';
import { URL } from '@/shared/constants/urls';

type ListingDateSelectorProps = {
  listingId: string;
};

export function ListingDateSelector({ listingId }: ListingDateSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { days, isLoading } = useAvailability(listingId);

  const [pendingCheckIn, setPendingCheckIn] = useState<Date | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedCheckIn = parseLocalDate(
    searchParams.get('checkIn') ?? undefined,
  );
  const selectedCheckOut = parseLocalDate(
    searchParams.get('checkOut') ?? undefined,
  );

  const clearUrlDates = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('checkIn');
    params.delete('checkOut');
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    if (isLoading || !selectedCheckIn || !selectedCheckOut) return;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (selectedCheckIn < today || selectedCheckOut < today) {
      setValidationError('Выбранные даты уже прошли');
      clearUrlDates();
      return;
    }

    const bookedDates = new Set(
      days.filter((d) => d.status === 'booked').map((d) => d.date),
    );

    const checkInStr = toLocalDateString(selectedCheckIn);
    const checkOutStr = toLocalDateString(selectedCheckOut);

    if (bookedDates.has(checkInStr) || bookedDates.has(checkOutStr)) {
      setValidationError('Выбранные даты недоступны для бронирования');
      clearUrlDates();
      return;
    }

    if (selectedCheckOut <= selectedCheckIn) {
      setValidationError('Дата выезда должна быть позже даты заезда');
      clearUrlDates();
      return;
    }

    setValidationError(null);
  }, [days, isLoading, selectedCheckIn, selectedCheckOut, clearUrlDates]);

  const handleDateSelect = useCallback(
    (checkIn: Date, checkOut: Date | null, isNewSelection: boolean) => {
      setValidationError(null);
      const params = new URLSearchParams(searchParams.toString());

      if (isNewSelection || checkOut === null) {
        setPendingCheckIn(checkIn);
        params.set('checkIn', toLocalDateString(checkIn));
        params.delete('checkOut');
      } else {
        setPendingCheckIn(null);
        params.set('checkIn', toLocalDateString(checkIn));
        params.set('checkOut', toLocalDateString(checkOut));
      }

      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const handleBook = () => {
    if (selectedCheckIn && selectedCheckOut) {
      router.push(
        `${URL.CHECKOUT(listingId)}?checkIn=${toLocalDateString(selectedCheckIn)}&checkOut=${toLocalDateString(selectedCheckOut)}&guests=1`,
      );
    }
  };

  return (
    <div className="space-y-4">
      <AvailabilityCalendar
        listingId={listingId}
        selectedCheckIn={selectedCheckIn ?? undefined}
        selectedCheckOut={selectedCheckOut ?? undefined}
        onDateSelect={handleDateSelect}
        mode="select"
      />
      {validationError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
      {selectedCheckIn && selectedCheckOut && !validationError && (
        <>
          <p className="text-sm text-gray-600 px-1">
            {selectedCheckIn.toLocaleDateString('ru-RU')} —{' '}
            {selectedCheckOut.toLocaleDateString('ru-RU')}
          </p>
          <button
            onClick={handleBook}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Забронировать
          </button>
        </>
      )}
      {pendingCheckIn && (
        <p className="text-sm text-blue-600 px-1">Выберите дату выезда</p>
      )}
    </div>
  );
}

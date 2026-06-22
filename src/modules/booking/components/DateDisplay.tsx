/**
 * ANCHOR: booking
 * PURPOSE: Display selected dates with change button; opens modal for date editing.
 * Dependencies: AvailabilityCalendar, Modal, useRouter, useSearchParams.
 *
 * DO:
 * - URL-driven dates (read from searchParams)
 * - Open modal with calendar for date change
 * DONT:
 * - Duplicate date selection logic from useCheckout
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Pencil } from 'lucide-react';
import { Modal } from '@/shared/ui/modal';
import { AvailabilityCalendar } from '@/modules/listing/components/AvailabilityCalendar';
import { toLocalDateString, parseLocalDate } from '@/shared/utils/date';

type DateDisplayProps = {
  listingId: string;
};

export function DateDisplay({ listingId }: DateDisplayProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingCheckIn, setPendingCheckIn] = useState<Date | null>(null);
  const [pendingCheckOut, setPendingCheckOut] = useState<Date | null>(null);

  const checkIn = parseLocalDate(searchParams.get('checkIn') ?? undefined);
  const checkOut = parseLocalDate(searchParams.get('checkOut') ?? undefined);

  const handleDateSelect = useCallback(
    (newCheckIn: Date, newCheckOut: Date | null, isNewSelection: boolean) => {
      console.log(newCheckIn, newCheckOut, isNewSelection);
      if (isNewSelection) {
        setPendingCheckIn(newCheckIn);
        setPendingCheckOut(null);
      } else if (newCheckOut !== null) {
        setPendingCheckOut(newCheckOut);
      }
    },
    [],
  );

  const confirmDates = useCallback(() => {
    if (!pendingCheckIn || !pendingCheckOut) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('checkIn', toLocalDateString(pendingCheckIn));
    params.set('checkOut', toLocalDateString(pendingCheckOut));

    router.replace(`?${params.toString()}`, { scroll: false });
    setPendingCheckIn(null);
    setPendingCheckOut(null);
    setIsModalOpen(false);
  }, [pendingCheckIn, pendingCheckOut, router, searchParams]);

  const openModal = () => {
    setPendingCheckIn(checkIn);
    setPendingCheckOut(checkOut);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setPendingCheckIn(null);
    setPendingCheckOut(null);
    setIsModalOpen(false);
  };

  const canConfirm = pendingCheckIn && pendingCheckOut;

  if (!checkIn || !checkOut) {
    return (
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar size={20} />
          <span>Даты не выбраны</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Даты</h3>
            <p className="text-sm text-gray-600 mt-1">
              {checkIn.toLocaleDateString('ru-RU')} —{' '}
              {checkOut.toLocaleDateString('ru-RU')}
            </p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
          >
            <Pencil size={16} />
            Изменить
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Выберите даты">
        <AvailabilityCalendar
          listingId={listingId}
          selectedCheckIn={pendingCheckIn ?? undefined}
          selectedCheckOut={pendingCheckOut ?? undefined}
          onDateSelect={handleDateSelect}
          mode="select"
        />
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {!pendingCheckIn && 'Выберите дату заезда'}
            {pendingCheckIn && !pendingCheckOut && 'Выберите дату выезда'}
            {pendingCheckIn &&
              pendingCheckOut &&
              'Нажмите «Подтвердить» для сохранения'}
          </p>
          <button
            onClick={confirmDates}
            disabled={!canConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Подтвердить
          </button>
        </div>
      </Modal>
    </>
  );
}

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
 *
 * Selection logic:
 * 1. First click → checkIn (pending)
 * 2. Second click:
 *    - date > checkIn → checkOut (complete)
 *    - date < checkIn → swap (date becomes checkIn, old checkIn becomes checkOut)
 *    - date === checkIn → reset (clear all)
 * 3. When selection is complete and user clicks → reset to new checkIn
 */

'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAvailability } from '@/modules/listing/hooks/useAvailability';

type AvailabilityCalendarProps = {
  listingId: string;
  selectedCheckIn?: Date;
  selectedCheckOut?: Date;
  onDateSelect?: (
    checkIn: Date,
    checkOut: Date | null,
    isNewSelection: boolean,
  ) => void;
  mode?: 'view' | 'select';
};

const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

type SelectionState = 'idle' | 'pending' | 'complete';

function deriveInitialState(selectedCheckIn?: Date, selectedCheckOut?: Date) {
  if (selectedCheckIn && selectedCheckOut) {
    return {
      pendingCheckIn: selectedCheckIn,
      pendingCheckOut: selectedCheckOut,
      selectionState: 'complete' as SelectionState,
    };
  }
  if (selectedCheckIn) {
    return {
      pendingCheckIn: selectedCheckIn,
      pendingCheckOut: null,
      selectionState: 'pending' as SelectionState,
    };
  }
  return {
    pendingCheckIn: null,
    pendingCheckOut: null,
    selectionState: 'idle' as SelectionState,
  };
}

export function AvailabilityCalendar({
  listingId,
  selectedCheckIn,
  selectedCheckOut,
  onDateSelect,
  mode = 'view',
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  });
  const { days, isLoading } = useAvailability(listingId);

  const initialState = deriveInitialState(selectedCheckIn, selectedCheckOut);
  const [pendingCheckIn, setPendingCheckIn] = useState<Date | null>(
    () => initialState.pendingCheckIn,
  );
  const [pendingCheckOut, setPendingCheckOut] = useState<Date | null>(
    () => initialState.pendingCheckOut,
  );
  const [selectionState, setSelectionState] = useState<SelectionState>(
    () => initialState.selectionState,
  );

  const currentYear = currentDate.getUTCFullYear();
  const currentMonth = currentDate.getUTCMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(Date.UTC(currentYear, currentMonth, 1));
    const lastDay = new Date(Date.UTC(currentYear, currentMonth + 1, 0));
    const startPadding = firstDay.getUTCDay();

    const result: (Date | null)[] = [];

    for (let i = 0; i < startPadding; i++) {
      result.push(null);
    }

    for (let d = 1; d <= lastDay.getUTCDate(); d++) {
      result.push(new Date(Date.UTC(currentYear, currentMonth, d)));
    }

    return result;
  }, [currentYear, currentMonth]);

  const availabilityMap = useMemo(() => {
    const map = new Map<string, 'free' | 'booked' | 'past'>();
    for (const day of days) {
      map.set(day.date, day.status);
    }
    return map;
  }, [days]);

  const prevMonth = () => {
    setCurrentDate(
      (prev) =>
        new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() - 1, 1)),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      (prev) =>
        new Date(Date.UTC(prev.getUTCFullYear(), prev.getUTCMonth() + 1, 1)),
    );
  };

  const getDateStatus = (date: Date): 'free' | 'booked' | 'past' => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (date < today) return 'past';
    const key = date.toISOString().split('T')[0];
    return availabilityMap.get(key) ?? 'free';
  };

  const isDateSelected = (date: Date): boolean => {
    const checkInToUse = pendingCheckIn;
    const checkOutToUse = pendingCheckOut;
    if (!checkInToUse && !checkOutToUse) return false;
    const dateStr = date.toISOString().split('T')[0];
    const checkInStr = checkInToUse?.toISOString().split('T')[0];
    const checkOutStr = checkOutToUse?.toISOString().split('T')[0];
    return dateStr === checkInStr || dateStr === checkOutStr;
  };

  const isDateInRange = (date: Date): boolean => {
    if (!pendingCheckIn || !pendingCheckOut) return false;
    const time = date.getTime();
    return time > pendingCheckIn.getTime() && time < pendingCheckOut.getTime();
  };

  const isFree = (date: Date): boolean => getDateStatus(date) === 'free';

  const handleDateClick = (date: Date) => {
    if (mode !== 'select' || !onDateSelect) return;
    if (!isFree(date)) return;

    if (selectionState === 'idle') {
      setPendingCheckIn(date);
      setPendingCheckOut(null);
      setSelectionState('pending');
      onDateSelect(date, null, true);
    } else if (selectionState === 'pending' && pendingCheckIn) {
      const clickedTime = date.getTime();
      const checkInTime = pendingCheckIn.getTime();

      if (clickedTime === checkInTime) {
        setPendingCheckIn(null);
        setPendingCheckOut(null);
        setSelectionState('idle');
        onDateSelect(date, null, true);
      } else if (clickedTime > checkInTime) {
        setPendingCheckIn(pendingCheckIn);
        setPendingCheckOut(date);
        setSelectionState('complete');
        onDateSelect(pendingCheckIn, date, false);
      } else {
        setPendingCheckIn(date);
        setPendingCheckOut(pendingCheckIn);
        setSelectionState('complete');
        onDateSelect(date, pendingCheckIn, false);
      }
    } else if (selectionState === 'complete') {
      setPendingCheckIn(date);
      setPendingCheckOut(null);
      setSelectionState('pending');
      onDateSelect(date, null, true);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32" />
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-xl border">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Предыдущий месяц"
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="font-medium">
          {MONTHS[currentMonth]} {currentYear}
        </h3>
        <button
          onClick={nextMonth}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Следующий месяц"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-gray-500 py-1 text-xs">
            {day}
          </div>
        ))}

        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} />;
          }

          const status = getDateStatus(date);
          const isSelected = isDateSelected(date);
          const inRange = isDateInRange(date);
          const isPast = status === 'past';
          const isBooked = status === 'booked';
          const isClickable = mode === 'select' && isFree(date) && !isPast;

          let classes =
            'h-10 rounded-lg flex items-center justify-center text-sm ';

          if (isSelected) {
            classes += 'bg-blue-600 text-white font-medium ';
          } else if (inRange) {
            classes += 'bg-blue-100 text-blue-800 ';
          } else if (isPast) {
            classes += 'bg-gray-100 text-gray-400 cursor-not-allowed ';
          } else if (isBooked) {
            classes += 'bg-red-100 text-red-400 cursor-not-allowed ';
          } else if (isFree(date)) {
            classes +=
              mode === 'select'
                ? 'bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer '
                : 'bg-green-100 text-green-700 ';
          } else {
            classes += 'hover:bg-blue-50 cursor-pointer ';
          }

          return (
            <div
              key={date.toISOString()}
              className={classes}
              onClick={() => isClickable && handleDateClick(date)}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span>Свободно</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-red-400 rounded" />
          <span>Занято</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-gray-200 rounded" />
          <span>Прошедшие</span>
        </div>
      </div>
    </div>
  );
}

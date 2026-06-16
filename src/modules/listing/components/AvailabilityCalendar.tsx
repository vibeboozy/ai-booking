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

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAvailability } from '@/modules/listing/hooks/useAvailability';

type AvailabilityCalendarProps = {
  listingId: string;
  selectedCheckIn?: Date;
  selectedCheckOut?: Date;
  onDateSelect?: (checkIn: Date, checkOut: Date) => void;
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

export function AvailabilityCalendar({
  listingId,
  selectedCheckIn,
  selectedCheckOut,
  onDateSelect,
  mode = 'view',
}: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const { days, isLoading } = useAvailability(listingId);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startPadding = firstDay.getDay();

    const result: (Date | null)[] = [];

    for (let i = 0; i < startPadding; i++) {
      result.push(null);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      result.push(new Date(currentYear, currentMonth, d));
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
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const getDateStatus = (date: Date): 'free' | 'booked' | 'past' => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return 'past';
    const key = date.toISOString().split('T')[0];
    return availabilityMap.get(key) ?? 'free';
  };

  const isDateSelected = (date: Date): boolean => {
    if (!selectedCheckIn && !selectedCheckOut) return false;
    const dateStr = date.toISOString().split('T')[0];
    const checkInStr = selectedCheckIn?.toISOString().split('T')[0];
    const checkOutStr = selectedCheckOut?.toISOString().split('T')[0];
    return dateStr === checkInStr || dateStr === checkOutStr;
  };

  const isDateInRange = (date: Date): boolean => {
    if (!selectedCheckIn || !selectedCheckOut) return false;
    const time = date.getTime();
    return (
      time > selectedCheckIn.getTime() && time < selectedCheckOut.getTime()
    );
  };

  const isFree = (date: Date): boolean => getDateStatus(date) === 'free';

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
              onClick={() => {
                if (isClickable && onDateSelect) {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const nextWeek = new Date(today);
                  nextWeek.setDate(nextWeek.getDate() + 7);
                  onDateSelect(today, nextWeek);
                }
              }}
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

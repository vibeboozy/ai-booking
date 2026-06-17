/**
 * ANCHOR: search
 * PURPOSE: DateRangePicker — два отдельных DateInput для выбора checkIn и checkOut.
 * Dependencies: @/components/ui/popover, @/components/ui/calendar, date-fns.
 * CRITICAL: checkOut должен быть строго позже checkIn.
 *
 * @PreConditions:
 * - checkIn не может быть в прошлом
 * - checkOut должен быть строго позже checkIn
 *
 * @PostConditions:
 * - при успехе: onSelect вызывается с { checkIn: string, checkOut: string } в формате YYYY-MM-DD
 *
 * @SideEffects: нет
 */

'use client';

import * as React from 'react';
import { DateInput } from './DateInput';

interface DateRangePickerProps {
  checkIn: string;
  checkOut: string;
  onSelect: (range: { checkIn: string; checkOut: string }) => void;
  className?: string;
}

function isRangeValid(checkIn: Date, checkOut: Date): boolean {
  return checkOut > checkIn;
}

// [START_SEARCH_DATE_RANGE_PICKER]

export function DateRangePicker({
  checkIn,
  checkOut,
  onSelect,
  className,
}: DateRangePickerProps) {
  console.log('[search][DateRangePicker][SEARCH_DATE_RANGE_PICKER][ENTRY]', {
    checkIn,
    checkOut,
  });

  const [error, setError] = React.useState('');

  const handleCheckInSelect = (date: string) => {
    setError('');
    if (
      checkOut &&
      !isRangeValid(
        new Date(date + 'T00:00:00'),
        new Date(checkOut + 'T00:00:00'),
      )
    ) {
      onSelect({ checkIn: date, checkOut: '' });
    } else {
      onSelect({ checkIn: date, checkOut });
    }
  };

  const handleCheckOutSelect = (date: string) => {
    setError('');
    if (
      checkIn &&
      !isRangeValid(
        new Date(checkIn + 'T00:00:00'),
        new Date(date + 'T00:00:00'),
      )
    ) {
      setError('Дата выезда должна быть позже даты заезда');
      return;
    }
    onSelect({ checkIn, checkOut: date });
  };

  return (
    <div className={className}>
      {error && (
        <div className="p-2 px-3 mb-1 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <div className="flex-1">
          <DateInput
            value={checkIn}
            onSelect={handleCheckInSelect}
            placeholder="Дата заезда"
          />
        </div>
        <div className="flex-1">
          <DateInput
            value={checkOut}
            onSelect={handleCheckOutSelect}
            placeholder="Дата выезда"
          />
        </div>
      </div>
    </div>
  );
}
// [END_SEARCH_DATE_RANGE_PICKER]

/**
 * ANCHOR: search
 * PURPOSE: DateInput — одиночный DatePicker с Popover для выбора одной даты.
 * Dependencies: @/components/ui/popover, @/components/ui/calendar, date-fns.
 * CRITICAL: Дата не может быть в прошлом.
 *
 * @PreConditions:
 * - Дата не может быть в прошлом
 *
 * @PostConditions:
 * - при успехе: onSelect вызывается с датой в формате YYYY-MM-DD
 *
 * @SideEffects: нет
 */

'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/shared/utils/cn';

const DATE_INPUT_FORMAT = 'dd.MM.yyyy';
const DATE_OUTPUT_FORMAT = 'yyyy-MM-dd';

interface DateInputProps {
  value: string;
  onSelect: (date: string) => void;
  placeholder?: string;
  className?: string;
}

function formatOutputDate(date: Date): string {
  return format(date, DATE_OUTPUT_FORMAT);
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr + 'T00:00:00');
    return format(date, DATE_INPUT_FORMAT, { locale: ru });
  } catch {
    return dateStr;
  }
}

// [START_SEARCH_DATE_INPUT]

export function DateInput({
  value,
  onSelect,
  placeholder = 'ДД.ММ.ГГГГ',
  className,
}: DateInputProps) {
  console.log('[search][DateInput][SEARCH_DATE_INPUT][ENTRY]', { value });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [open, setOpen] = React.useState(false);

  const disabledDays = React.useMemo(() => {
    return { before: today };
  }, [today]);

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;

    console.log('[search][DateInput][SEARCH_DATE_INPUT][EXIT]', {
      result: formatOutputDate(date),
    });

    onSelect(formatOutputDate(date));
    setOpen(false);
  };

  const displayValue = value ? formatDisplayDate(value) : '';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
            className,
          )}
          aria-label={placeholder}
        >
          <span
            className={
              displayValue ? 'text-foreground' : 'text-muted-foreground'
            }
          >
            {displayValue || placeholder}
          </span>
          <CalendarDays className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto bg-background p-0 border rounded-lg shadow-lg"
        align="start"
      >
        <div className="p-2 bg-background">
          <Calendar
            mode="single"
            selected={value ? new Date(value + 'T00:00:00') : undefined}
            onSelect={handleSelect}
            disabled={disabledDays}
            numberOfMonths={1}
            showOutsideDays
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
// [END_SEARCH_DATE_INPUT]

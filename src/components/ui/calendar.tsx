/**
 * ANCHOR: shared
 * PURPOSE: Calendar — враппер над react-day-picker.
 * Dependencies: react-day-picker, date-fns.
 */

'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/shared/utils/cn';

export type { DayPickerProps } from 'react-day-picker';

export function Calendar({
  className,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  console.log('[shared][Calendar][SHARED_CALENDAR][ENTRY]', { className });

  return (
    <DayPicker
      className={cn('p-3', className)}
      {...props}
    />
  );
}
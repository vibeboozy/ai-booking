/**
 * ANCHOR: shared
 * PURPOSE: Label primitive (shadcn-style).
 */

import { type LabelHTMLAttributes } from 'react';

import { cn } from '@/shared/utils/cn';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      )}
      {...props}
    />
  );
}

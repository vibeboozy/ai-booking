/**
 * ANCHOR: shared
 * PURPOSE: Checkbox — для множественного выбора удобств.
 * Dependencies: @/shared/utils/cn.
 */

'use client';

import * as React from 'react';

import { cn } from '@/shared/utils/cn';

export interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  id,
  checked = false,
  onCheckedChange,
  label,
  disabled = false,
  className,
}: CheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange?.(e.target.checked);
  };

  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-2 text-sm',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className="peer sr-only"
        />
        <div className="flex h-5 w-5 items-center justify-center rounded border border-input bg-background ring-offset-background transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          <svg
            className="h-4 w-4 fill-none stroke-current stroke-2 opacity-0 peer-checked:opacity-100"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>
      {label}
    </label>
  );
}
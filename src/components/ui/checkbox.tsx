/**
 * ANCHOR: shared
 * PURPOSE: Checkbox — для множественного выбора удобств.
 * Dependencies: @/shared/utils/cn.
 */

'use client';

import * as React from 'react';
import { cn } from '@/shared/utils/cn';
import { Check } from 'lucide-react';

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
  const [isChecked, setIsChecked] = React.useState(checked);

  React.useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setIsChecked(newValue);
    onCheckedChange?.(newValue);
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
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={cn(
            'flex h-5 w-5 items-center justify-center rounded border border-input bg-background ring-offset-background transition-colors',
            isChecked && 'border-primary bg-primary',
            !isChecked && 'bg-background',
            'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          {isChecked && (
            <Check className="h-4 w-4 text-white" strokeWidth={2} />
          )}
        </div>
      </div>
      {label}
    </label>
  );
}

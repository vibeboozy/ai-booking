/**
 * ANCHOR: shared
 * PURPOSE: Sheet/Drawer — выдвижная панель для мобильных фильтров.
 * Dependencies: @/shared/utils/cn.
 */

'use client';

import * as React from 'react';

import { cn } from '@/shared/utils/cn';
import { X } from 'lucide-react';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

export function Sheet({ open, onOpenChange, children, className }: SheetProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        className={cn(
          'absolute right-0 top-0 h-full w-4/5 max-w-sm bg-background p-6 shadow-lg',
          className,
        )}
      >
        <div className="flex justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-full p-2 hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
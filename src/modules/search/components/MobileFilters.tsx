/**
 * ANCHOR: search
 * PURPOSE: Mobile layout with drawer for filters.
 */

'use client';

import * as React from 'react';
import { SlidersHorizontal } from 'lucide-react';

import { useSearchFilters } from '@/modules/search/hooks/useSearchFilters';
import { FiltersContent } from './FiltersContent';
import { Button } from '@/shared/ui/button';
import { Sheet } from '@/components/ui/sheet';
import type { PropertyType } from '@/shared/types/listing';

function countActiveFilters(params: {
  priceMin?: number;
  priceMax?: number;
  propertyType?: PropertyType;
  amenities?: string[];
}): number {
  let count = 0;
  if (params.priceMin !== undefined) count++;
  if (params.priceMax !== undefined) count++;
  if (params.propertyType !== undefined) count++;
  if (params.amenities?.length) count += params.amenities.length;
  return count;
}

export function MobileFilters() {
  const { params, setParams, resetFilters } = useSearchFilters();
  const [open, setOpen] = React.useState(false);
  const activeCount = countActiveFilters(params);

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Фильтры
        {activeCount > 0 && (
          <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
            {activeCount}
          </span>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Фильтры</h2>
          <button
            type="button"
            onClick={resetFilters}
            className="text-sm text-primary hover:underline"
          >
            Сбросить все
          </button>
        </div>
        <div className="mt-6">
          <FiltersContent
            params={params}
            setParams={setParams}
            resetFilters={resetFilters}
          />
        </div>
      </Sheet>
    </div>
  );
}

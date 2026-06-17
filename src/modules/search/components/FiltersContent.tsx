/**
 * ANCHOR: search
 * PURPOSE: Combines all filter sections into single content block.
 */

'use client';

import { FilterSection } from './FilterSection';
import { PriceSliderSection } from './PriceSliderSection';
import { PropertyTypeToggles } from './PropertyTypeToggles';
import { AmenitiesCheckboxes } from './AmenitiesCheckboxes';
import { ActiveFilterBadges } from './ActiveFilterBadges';
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

export function FiltersContent({
  params,
  setParams,
  resetFilters,
}: {
  params: {
    priceMin?: number;
    priceMax?: number;
    propertyType?: PropertyType;
    amenities?: string[];
  };
  setParams: (partial: Partial<typeof params>) => void;
  resetFilters: () => void;
}) {
  const activeCount = countActiveFilters(params);

  return (
    <div className="space-y-6">
      <ActiveFilterBadges count={activeCount} onReset={resetFilters} />

      <FilterSection title="Цена">
        <PriceSliderSection
          priceMin={params.priceMin}
          priceMax={params.priceMax}
          onChange={([priceMin, priceMax]) => {
            setParams({ priceMin, priceMax });
          }}
        />
      </FilterSection>

      <FilterSection title="Тип жилья">
        <PropertyTypeToggles
          selected={params.propertyType}
          onChange={(propertyType) => setParams({ propertyType })}
        />
      </FilterSection>

      <FilterSection title="Удобства">
        <AmenitiesCheckboxes
          selected={params.amenities}
          onChange={(amenities) => setParams({ amenities })}
        />
      </FilterSection>
    </div>
  );
}
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
import {
  PRICE_SLIDER_MAX,
  PRICE_SLIDER_MIN,
} from '@/modules/search/constants/searchFilters';

function countActiveFilters(params: {
  priceMin?: number;
  priceMax?: number;
  propertyType?: PropertyType;
  amenities?: string[];
}): number {
  let count = 0;

  const priceMin = params.priceMin ?? PRICE_SLIDER_MIN;
  const priceMax = params.priceMax ?? PRICE_SLIDER_MAX;
  const isPriceFiltered =
    priceMin !== PRICE_SLIDER_MIN || priceMax !== PRICE_SLIDER_MAX;

  if (isPriceFiltered) count++;

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

      <ActiveFilterBadges count={activeCount} onReset={resetFilters} />
    </div>
  );
}

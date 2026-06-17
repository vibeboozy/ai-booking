/**
 * ANCHOR: search
 * PURPOSE: Price range filter with dual-thumb slider.
 */

'use client';

import * as React from 'react';

import {
  PRICE_SLIDER_MAX,
  PRICE_SLIDER_MIN,
  PRICE_SLIDER_STEP,
} from '@/modules/search/constants/searchFilters';
import { formatPrice } from '@/shared/utils/formatPrice';
import { PriceSlider } from '@/components/ui/slider';

export function PriceSliderSection({
  priceMin,
  priceMax,
  onChange,
}: {
  priceMin?: number;
  priceMax?: number;
  onChange: (value: [number, number]) => void;
}) {
  const [localValue, setLocalValue] = React.useState<[number, number]>([
    priceMin ?? PRICE_SLIDER_MIN,
    priceMax ?? PRICE_SLIDER_MAX,
  ]);

  React.useEffect(() => {
    setLocalValue([priceMin ?? PRICE_SLIDER_MIN, priceMax ?? PRICE_SLIDER_MAX]);
  }, [priceMin, priceMax]);

  const handleValueChange = (value: [number, number]) => {
    console.log('[search][SearchFilters][PRICE_CHANGE][ENTRY]', { value });
    setLocalValue(value);
    console.log('[search][SearchFilters][DEBOUNCE_START]');
    onChange(value);
    console.log('[search][SearchFilters][PRICE_CHANGE][EXIT]');
  };

  const isFullRange = localValue[0] === PRICE_SLIDER_MIN && localValue[1] === PRICE_SLIDER_MAX;

  return (
    <div>
      {isFullRange && (
        <p className="text-sm text-muted-foreground mb-2">Любая цена</p>
      )}
      <PriceSlider
        min={PRICE_SLIDER_MIN}
        max={PRICE_SLIDER_MAX}
        step={PRICE_SLIDER_STEP}
        value={localValue}
        onValueChange={handleValueChange}
        formatValue={formatPrice}
      />
    </div>
  );
}
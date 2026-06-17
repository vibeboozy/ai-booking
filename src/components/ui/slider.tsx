/**
 * ANCHOR: shared
 * PURPOSE: Slider — range input с двойным ползунком для цены.
 * Dependencies: @/shared/utils/cn.
 */

'use client';

import * as React from 'react';

import { cn } from '@/shared/utils/cn';

export interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
  className?: string;
}

export function PriceSlider({
  min = 0,
  max = 100,
  step = 1,
  value,
  onValueChange,
  formatValue = (v) => String(v),
  className,
}: SliderProps) {
  const [localValue, setLocalValue] = React.useState(value);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), localValue[1] - step);
    const newValue: [number, number] = [newMin, localValue[1]];
    setLocalValue(newValue);
    onValueChange(newValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), localValue[0] + step);
    const newValue: [number, number] = [localValue[0], newMax];
    setLocalValue(newValue);
    onValueChange(newValue);
  };

  const minPercent = ((localValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100;

  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-2 w-full">
        <div className="absolute h-2 w-full rounded-full bg-muted" />
        <div
          className="absolute h-2 rounded-full bg-primary"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={handleMinChange}
          className="absolute w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-background"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={handleMaxChange}
          className="absolute w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-background"
        />
      </div>
      <div className="mt-2 flex justify-between text-sm text-muted-foreground">
        <span>{formatValue(localValue[0])}</span>
        <span>{formatValue(localValue[1])}</span>
      </div>
    </div>
  );
}
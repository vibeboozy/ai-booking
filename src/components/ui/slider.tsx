/**
 * ANCHOR: shared
 * PURPOSE: Slider — range input с двойным ползунком для цены.
 * Dependencies: @/shared/utils/cn.
 *
 * Implementation: Uses two overlapping range inputs for visual effect,
 * but pointer events are disabled on inputs. A transparent clickable
 * overlay handles clicks/touches and moves the nearest thumb.
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
  const trackRef = React.useRef<HTMLDivElement>(null);
  const isDraggingRef = React.useRef<'min' | 'max' | null>(null);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const getPercentFromEvent = (e: React.MouseEvent | React.TouchEvent): number => {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const percent = ((clientX - rect.left) / rect.width) * 100;
    return Math.min(Math.max(percent, 0), 100);
  };

  const valueFromPercent = (percent: number): number => {
    const raw = (percent / 100) * (max - min) + min;
    return Math.round(raw / step) * step;
  };

  const handleMinChange = (newMin: number) => {
    const validated = Math.min(newMin, localValue[1] - step);
    const result: [number, number] = [validated, localValue[1]];
    setLocalValue(result);
    onValueChange(result);
  };

  const handleMaxChange = (newMax: number) => {
    const validated = Math.max(newMax, localValue[0] + step);
    const result: [number, number] = [localValue[0], validated];
    setLocalValue(result);
    onValueChange(result);
  };

  const handleTrackMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const percent = getPercentFromEvent(e);
    const clickValue = valueFromPercent(percent);
    const distToMin = Math.abs(clickValue - localValue[0]);
    const distToMax = Math.abs(clickValue - localValue[1]);
    if (distToMin <= distToMax) {
      isDraggingRef.current = 'min';
      handleMinChange(clickValue);
    } else {
      isDraggingRef.current = 'max';
      handleMaxChange(clickValue);
    }
  };

  const handleTrackClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDraggingRef.current) return;
    const percent = getPercentFromEvent(e);
    const clickValue = valueFromPercent(percent);
    const distToMin = Math.abs(clickValue - localValue[0]);
    const distToMax = Math.abs(clickValue - localValue[1]);
    if (distToMin <= distToMax) {
      handleMinChange(clickValue);
    } else {
      handleMaxChange(clickValue);
    }
  };

  const handleMinDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDraggingRef.current = 'min';
  };

  const handleMaxDrag = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDraggingRef.current = 'max';
  };

  const handleDragMove = React.useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();

      const target = e.target as HTMLElement;
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const percent = ((clientX - rect.left) / rect.width) * 100;
      const clampedPercent = Math.min(Math.max(percent, 0), 100);
      const newValue = valueFromPercent(clampedPercent);

      if (isDraggingRef.current === 'min') {
        const validated = Math.min(newValue, localValue[1] - step);
        const result: [number, number] = [validated, localValue[1]];
        setLocalValue(result);
        onValueChange(result);
      } else {
        const validated = Math.max(newValue, localValue[0] + step);
        const result: [number, number] = [localValue[0], validated];
        setLocalValue(result);
        onValueChange(result);
      }
    },
    [localValue, onValueChange, step],
  );

  const handleDragEnd = React.useCallback(() => {
    isDraggingRef.current = null;
  }, []);

  React.useEffect(() => {
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('touchmove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  const minPercent = ((localValue[0] - min) / (max - min)) * 100;
  const maxPercent = ((localValue[1] - min) / (max - min)) * 100;

  return (
    <div className={cn('w-full', className)}>
      <div
        ref={trackRef}
        className="relative h-2 w-full cursor-pointer"
        onClick={handleTrackClick}
        onMouseDown={handleTrackMouseDown}
        onTouchStart={handleTrackMouseDown}
      >
        <div className="absolute h-2 w-full rounded-full bg-muted" />
        <div
          className="absolute h-2 rounded-full bg-primary"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
        />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 cursor-grab rounded-full bg-primary ring-2 ring-background"
          style={{ left: `calc(${minPercent}% - 8px)` }}
          onMouseDown={handleMinDrag}
          onTouchStart={handleMinDrag}
        />
        <div
          className="absolute top-1/2 h-4 w-4 -translate-y-1/2 cursor-grab rounded-full bg-primary ring-2 ring-background"
          style={{ left: `calc(${maxPercent}% - 8px)` }}
          onMouseDown={handleMaxDrag}
          onTouchStart={handleMaxDrag}
        />
      </div>
      <div className="mt-2 flex justify-between text-sm text-muted-foreground">
        <span>{formatValue(localValue[0])}</span>
        <span>{formatValue(localValue[1])}</span>
      </div>
    </div>
  );
}
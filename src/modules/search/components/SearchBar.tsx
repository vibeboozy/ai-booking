/**
 * ANCHOR: search
 * PURPOSE: Главная форма поиска: город, даты, гости, кнопка «Найти».
 * Dependencies: LocationAutocomplete, @/shared/utils/buildSearchUrl, next/navigation.
 * CRITICAL: Submit → navigate to /search с URL params; без useState для фильтров.
 *
 * DO:
 * - Progressive enhancement (form action fallback)
 * DONT:
 * - Хранить search state только в useState без URL sync
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { LocationAutocomplete } from './LocationAutocomplete';
import { buildSearchUrl } from '@/shared/utils/buildSearchUrl';
import type { Location } from '@/modules/search/types';

// [START_SEARCH_BAR_COMPONENT]

const MIN_GUESTS = 1;
const MAX_GUESTS = 16;
const DEFAULT_GUESTS = 2;

const MONTHS_RU = [
  'янв', 'фев', 'мар', 'апр', 'май', 'июн',
  'июл', 'авг', 'сен', 'окт', 'ноя', 'дек',
];

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${day} ${MONTHS_RU[month - 1]} ${year}`;
}

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  console.log('[search][SearchBar][SEARCH_BAR_COMPONENT][ENTRY]', {});

  const router = useRouter();

  const [city, setCity] = useState('');
  const [cityLocation, setCityLocation] = useState<Location | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(DEFAULT_GUESTS);
  const [dateError, setDateError] = useState('');

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultCheckIn = tomorrow.toISOString().split('T')[0];
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    const defaultCheckOut = dayAfter.toISOString().split('T')[0];
    setCheckIn(defaultCheckIn);
    setCheckOut(defaultCheckOut);
  }, []);

  const validateDates = useCallback((): boolean => {
    console.log(
      '[search][SearchBar][SEARCH_BAR_COMPONENT][DECISION]',
      { checkIn, checkOut, reason: 'validating dates' },
    );

    if (!checkIn || !checkOut) {
      setDateError('');
      return true;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      setDateError('Дата выезда должна быть позже даты заезда');
      console.log(
        '[search][SearchBar][SEARCH_BAR_COMPONENT][DECISION]',
        { reason: 'validation failed - checkOut <= checkIn' },
      );
      return false;
    }

    setDateError('');
    return true;
  }, [checkIn, checkOut]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      console.log(
        '[search][SearchBar][SEARCH_BAR_COMPONENT][DECISION]',
        { city, checkIn, checkOut, guests, reason: 'form submit' },
      );

      if (!validateDates()) {
        return;
      }

      const url = buildSearchUrl({
        city: cityLocation?.name || city,
        checkIn,
        checkOut,
        guests,
      });

      console.log(
        '[search][SearchBar][SEARCH_BAR_COMPONENT][EXIT]',
        { result: 'navigating', url },
      );

      router.push(url);
    },
    [city, cityLocation, checkIn, checkOut, guests, router, validateDates],
  );

  const incrementGuests = () => {
    console.log(
      '[search][SearchBar][SEARCH_BAR_COMPONENT][DECISION]',
      { guests, reason: 'increment guests' },
    );
    setGuests((g) => Math.min(g + 1, MAX_GUESTS));
  };

  const decrementGuests = () => {
    console.log(
      '[search][SearchBar][SEARCH_BAR_COMPONENT][DECISION]',
      { guests, reason: 'decrement guests' },
    );
    setGuests((g) => Math.max(g - 1, MIN_GUESTS));
  };

  const handleLocationSelect = (location: Location) => {
    console.log(
      '[search][SearchBar][SEARCH_BAR_COMPONENT][DECISION]',
      { location: location.name, reason: 'location selected' },
    );
    setCityLocation(location);
    setCity(location.name);
  };

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckIn = e.target.value;
    console.log(
      '[search][SearchBar][SEARCH_BAR_COMPONENT][DECISION]',
      { checkIn: newCheckIn, reason: 'checkIn changed' },
    );
    setCheckIn(newCheckIn);

    if (checkOut && new Date(newCheckIn) >= new Date(checkOut)) {
      const nextDay = new Date(newCheckIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCheckOut = e.target.value;
    console.log(
      '[search][SearchBar][SEARCH_BAR_COMPONENT][DECISION]',
      { checkOut: newCheckOut, reason: 'checkOut changed' },
    );
    setCheckOut(newCheckOut);
    validateDates();
  };

  console.log('[search][SearchBar][SEARCH_BAR_COMPONENT][EXIT]', { city, checkIn, checkOut, guests });

  return (
    <div className={className}>
      <form
        ref={formRef}
        action="/search"
        method="get"
        onSubmit={handleSubmit}
        className="relative"
      >
        <div className="flex flex-col gap-2 rounded-xl border bg-background p-2 shadow-sm md:flex-row md:items-center md:gap-0">
          <div className="relative flex-1 border-b border-r-0 p-2 md:border-b-0 md:border-r md:pr-4">
            <Label htmlFor="city-input" className="mb-1 block text-xs font-medium text-muted-foreground">
              Место
            </Label>
            <LocationAutocomplete
              value={city}
              onChange={setCity}
              onSelect={handleLocationSelect}
            />
          </div>

          <div className="flex flex-1 flex-col border-b border-r-0 p-2 md:border-b-0 md:border-r md:px-2">
            <Label htmlFor="checkin-input" className="mb-1 block text-xs font-medium text-muted-foreground">
              Заезд
            </Label>
            <Input
              id="checkin-input"
              type="date"
              name="checkIn"
              value={checkIn}
              onChange={handleCheckInChange}
              min={new Date().toISOString().split('T')[0]}
              className="border-0 p-0 shadow-none focus-visible:ring-0"
              aria-describedby={dateError ? 'date-error' : undefined}
            />
          </div>

          <div className="flex flex-1 flex-col border-b border-r-0 p-2 md:border-b-0 md:border-r md:px-2">
            <Label htmlFor="checkout-input" className="mb-1 block text-xs font-medium text-muted-foreground">
              Выезд
            </Label>
            <Input
              id="checkout-input"
              type="date"
              name="checkOut"
              value={checkOut}
              onChange={handleCheckOutChange}
              min={checkIn || new Date().toISOString().split('T')[0]}
              className="border-0 p-0 shadow-none focus-visible:ring-0"
              aria-describedby={dateError ? 'date-error' : undefined}
            />
          </div>

          <div className="flex flex-col border-b-0 p-2 md:border-r md:pr-4">
            <Label className="mb-1 block text-xs font-medium text-muted-foreground">
              Гости
            </Label>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decrementGuests}
                disabled={guests <= MIN_GUESTS}
                aria-label="Уменьшить количество гостей"
                className="h-8 w-8"
              >
                −
              </Button>
              <span className="w-8 text-center text-sm" aria-live="polite">
                {guests}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={incrementGuests}
                disabled={guests >= MAX_GUESTS}
                aria-label="Увеличить количество гостей"
                className="h-8 w-8"
              >
                +
              </Button>
            </div>
            <input type="hidden" name="guests" value={guests} />
          </div>

          <div className="p-2 md:pl-2">
            <Button type="submit" className="w-full md:w-auto">
              Найти
            </Button>
          </div>
        </div>

        {dateError && (
          <p id="date-error" className="mt-2 text-sm text-destructive" role="alert">
            {dateError}
          </p>
        )}
      </form>

      <div className="mt-2 text-xs text-muted-foreground">
        {city && (
          <span>
            {city}
            {checkIn && checkOut && ` · ${formatDateDisplay(checkIn)} — ${formatDateDisplay(checkOut)}`}
            {` · ${guests} ${guests === 1 ? 'гость' : guests < 5 ? 'гостя' : 'гостей'}`}
          </span>
        )}
      </div>
    </div>
  );
}
// [END_SEARCH_BAR_COMPONENT]
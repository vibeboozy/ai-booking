/**
 * ANCHOR: search
 * PURPOSE: Автокомплит городов/стран (debounced fetch /api/locations/autocomplete).
 * Dependencies: GET /api/locations/autocomplete.
 * CRITICAL: Min 2 chars; debounce 300ms; keyboard + ARIA accessible.
 *
 * DO:
 * - getByRole queries in tests
 * DONT:
 * - Fetch on every keystroke without debounce
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/shared/ui/input';
import type { Location } from '@/modules/search/types';

// [START_LOCATION_AUTOCOMPLETE_INPUT]

const DEBOUNCE_MS = 300;
const MIN_CHARS = 2;
const API_LIMIT = 5;

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (location: Location) => void;
}

export function LocationAutocomplete({
  value,
  onChange,
  onSelect,
}: LocationAutocompleteProps) {
  console.log(
    '[search][LocationAutocomplete][LOCATION_AUTOCOMPLETE_INPUT][ENTRY]',
    { value },
  );

  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchLocations = useCallback(
    async (query: string) => {
      console.log(
        '[search][LocationAutocomplete][LOCATION_AUTOCOMPLETE_INPUT][DECISION]',
        { query, reason: 'fetchLocations called' },
      );

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        console.log(
          '[search][LocationAutocomplete][LOCATION_AUTOCOMPLETE_INPUT][DECISION]',
          { reason: 'aborted previous request' },
        );
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch(
          `/api/locations/autocomplete?q=${encodeURIComponent(query)}&limit=${API_LIMIT}`,
          { signal: controller.signal },
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const { data } = (await res.json()) as { data: Location[] };
        console.log(
          '[search][LocationAutocomplete][LOCATION_AUTOCOMPLETE_INPUT][EXIT]',
          { result: 'success', count: data.length },
        );

        return data;
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          console.log(
            '[search][LocationAutocomplete][LOCATION_AUTOCOMPLETE_INPUT][DECISION]',
            { reason: 'request aborted' },
          );
          return null;
        }

        console.error(
          '[search][LocationAutocomplete][LOCATION_AUTOCOMPLETE_INPUT][ERROR]',
          { error: (error as Error).message },
        );
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    console.log(
      '[search][LocationAutocomplete][LOCATION_AUTOCOMPLETE_INPUT][DECISION]',
      {
        valueLength: value.length,
        reason: value.length >= MIN_CHARS ? 'value length >= 2' : 'value too short',
      },
    );

    if (value.length < MIN_CHARS) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      console.log(
        '[search][LocationAutocomplete][LOCATION_AUTOCOMPLETE_INPUT][DECISION]',
        { reason: 'debounce complete, fetching' },
      );

      const data = await fetchLocations(value);

      if (data !== null) {
        setResults(data);
        setIsOpen(true);
        setHighlightedIndex(-1);
      }

      setIsLoading(false);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [value, fetchLocations]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      console.log(
        '[search][LocationAutocomplete][LOCATION_AUTOCOMPLETE_INPUT][DECISION]',
        { key: e.key, reason: 'keyboard event' },
      );

      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : prev,
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && results[highlightedIndex]) {
            const selected = results[highlightedIndex];
            onChange(selected.name);
            onSelect(selected);
            setIsOpen(false);
            setResults([]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    },
    [isOpen, highlightedIndex, results, onChange, onSelect],
  );

  const handleSelect = (location: Location) => {
    console.log(
      '[search][LocationAutocomplete][LOCATION_AUTOCOMPLETE_INPUT][DECISION]',
      { location: location.name, reason: 'item selected' },
    );

    onChange(location.name);
    onSelect(location);
    setIsOpen(false);
    setResults([]);
  };

  const handleFocus = () => {
    if (value.length >= MIN_CHARS && results.length > 0) {
      setIsOpen(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => setIsOpen(false), 150);
  };

  console.log(
    '[search][LocationAutocomplete][LOCATION_AUTOCOMPLETE_INPUT][EXIT]',
    { isOpen, resultsCount: results.length },
  );

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Куда едем?"
        autoComplete="off"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? 'location-listbox' : undefined}
        aria-activedescendant={
          highlightedIndex >= 0
            ? `location-option-${highlightedIndex}`
            : undefined
        }
      />

      {isOpen && (
        <ul
          ref={listboxRef}
          id="location-listbox"
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background py-1 shadow-md"
        >
          {isLoading ? (
            <li className="px-4 py-2 text-muted-foreground">Загрузка...</li>
          ) : results.length === 0 ? (
            <li className="px-4 py-2 text-muted-foreground">Ничего не найдено</li>
          ) : (
            results.map((location, index) => (
              <li
                key={location.id}
                id={`location-option-${index}`}
                role="option"
                aria-selected={index === highlightedIndex}
                className={`cursor-pointer px-4 py-2 ${
                  index === highlightedIndex
                    ? 'bg-muted'
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleSelect(location)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                <span className="font-medium">{location.name}</span>
                {location.type === 'city' && (
                  <span className="ml-1 text-xs text-muted-foreground">город</span>
                )}
                {location.type === 'country' && (
                  <span className="ml-1 text-xs text-muted-foreground">страна</span>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
// [END_LOCATION_AUTOCOMPLETE_INPUT]
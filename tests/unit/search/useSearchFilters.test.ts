/**
 * Unit tests for useSearchFilters hook
 * SC-F003-001: useSearchFilters reads params from URL
 * SC-F003-002: setParams updates URL with debounce for price
 * SC-F003-003: resetFilters preserves city and guests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSearchParams, useRouter } from 'next/navigation';

import { useSearchFilters } from '@/modules/search/hooks/useSearchFilters';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

describe('USE_SEARCH_FILTERS_HOOK', () => {
  const mockPush = vi.fn();

  const createMockSearchParams = (
    initialParams: Record<string, string> = {},
  ) => {
    const params = new URLSearchParams(initialParams);
    return params;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('SC-F003-001: useSearchFilters reads params from URL', () => {
    it('should parse priceMin and priceMax from URL', async () => {
      const mockParams = createMockSearchParams({
        priceMin: '1000000',
        priceMax: '5000000',
      });
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockParams);

      const { result } = renderHook(() => useSearchFilters());

      expect(result.current.params.priceMin).toBe(1000000);
      expect(result.current.params.priceMax).toBe(5000000);
    });

    it('should parse propertyType from URL', () => {
      const mockParams = createMockSearchParams({ propertyType: 'apartment' });
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockParams);

      const { result } = renderHook(() => useSearchFilters());

      expect(result.current.params.propertyType).toBe('apartment');
    });

    it('should parse amenities as sorted array', () => {
      const mockParams = createMockSearchParams({ amenities: 'kitchen,wifi' });
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockParams);

      const { result } = renderHook(() => useSearchFilters());

      expect(result.current.params.amenities).toEqual(['kitchen', 'wifi']);
    });

    it('should return empty object for invalid params', () => {
      const mockParams = createMockSearchParams({ priceMin: 'not-a-number' });
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockParams);

      const { result } = renderHook(() => useSearchFilters());

      expect(result.current.params.priceMin).toBeUndefined();
    });
  });

  describe('SC-F003-002: setParams updates URL with debounce for price', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should debounce price updates by 300ms', async () => {
      const mockParams = createMockSearchParams({ city: 'sochi' });
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockParams);

      const { result } = renderHook(() => useSearchFilters());

      result.current.setParams({ priceMax: 5000000 });

      expect(mockPush).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(300);

      expect(mockPush).toHaveBeenCalledWith(
        '/search?city=sochi&priceMax=5000000',
      );
    });

    it('should update URL immediately for non-price filters', async () => {
      const mockParams = createMockSearchParams({ city: 'sochi' });
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockParams);

      const { result } = renderHook(() => useSearchFilters());

      result.current.setParams({ propertyType: 'apartment' });

      expect(mockPush).toHaveBeenCalledWith(
        '/search?city=sochi&propertyType=apartment',
      );
    });

    it('should only call router.push once for rapid price updates', async () => {
      vi.useFakeTimers();

      const mockParams = createMockSearchParams({});
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockParams);

      const { result } = renderHook(() => useSearchFilters());

      result.current.setParams({ priceMin: 1000000 });
      result.current.setParams({ priceMin: 2000000 });
      result.current.setParams({ priceMin: 3000000 });

      await vi.advanceTimersByTimeAsync(300);

      expect(mockPush).toHaveBeenCalledTimes(1);
    });
  });

  describe('SC-F003-003: resetFilters preserves city and guests', () => {
    it('should remove price/propertyType/amenities but keep city/guests', () => {
      const mockParams = createMockSearchParams({
        city: 'sochi',
        guests: '3',
        priceMax: '5000000',
        propertyType: 'apartment',
      });
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockParams);

      const { result } = renderHook(() => useSearchFilters());

      result.current.resetFilters();

      expect(mockPush).toHaveBeenCalledWith('/search?city=sochi&guests=3');
    });

    it('should handle missing city/guests gracefully', () => {
      const mockParams = createMockSearchParams({
        priceMax: '5000000',
        propertyType: 'apartment',
      });
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockParams);

      const { result } = renderHook(() => useSearchFilters());

      result.current.resetFilters();

      expect(mockPush).toHaveBeenCalledWith('/search');
    });
  });

  describe('SC-F003-004: clearParams navigates to /search', () => {
    it('should navigate to /search with no query params', () => {
      const mockParams = createMockSearchParams({
        city: 'sochi',
        priceMax: '5000000',
      });
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockParams);

      const { result } = renderHook(() => useSearchFilters());

      result.current.clearParams();

      expect(mockPush).toHaveBeenCalledWith('/search');
    });
  });
});

describe('LOG_MARKERS', () => {
  const mockPush = vi.fn();

  const createMockSearchParams = (
    initialParams: Record<string, string> = {},
  ) => {
    const params = new URLSearchParams(initialParams);
    return params;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });
  });

  const getLogCalls = (): unknown[][] => {
    return (console.log as unknown as { mock: { calls: unknown[][] } }).mock
      .calls;
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('SC-F003-010: should log ENTRY and EXIT markers', () => {
    const mockParams = createMockSearchParams();
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockParams);

    const { result } = renderHook(() => useSearchFilters());

    expect(result.current).toBeDefined();

    const logCalls = getLogCalls();
    const hasEntryLog = logCalls.some(
      (call) =>
        typeof call[0] === 'string' &&
        call[0].includes(
          '[search][useSearchFilters][USE_SEARCH_FILTERS_HOOK][ENTRY]',
        ),
    );
    const hasExitLog = logCalls.some(
      (call) =>
        typeof call[0] === 'string' &&
        call[0].includes(
          '[search][useSearchFilters][USE_SEARCH_FILTERS_HOOK][EXIT]',
        ),
    );

    expect(hasEntryLog).toBe(true);
    expect(hasExitLog).toBe(true);
  });

  it('SC-F003-011: should log DEBOUNCE marker for price changes', async () => {
    vi.useFakeTimers();

    const mockParams = createMockSearchParams();
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockParams);

    const { result } = renderHook(() => useSearchFilters());

    result.current.setParams({ priceMax: 5000000 });

    const logCalls = getLogCalls();
    const hasDebounceLog = logCalls.some(
      (call) =>
        typeof call[0] === 'string' &&
        call[0].includes(
          '[search][useSearchFilters][USE_SEARCH_FILTERS_HOOK][DEBOUNCE]',
        ),
    );

    expect(hasDebounceLog).toBe(true);
  });

  it('SC-F003-012: should log RESET_FILTERS markers', () => {
    const mockParams = createMockSearchParams({ city: 'sochi' });
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockParams);

    const { result } = renderHook(() => useSearchFilters());

    result.current.resetFilters();

    const logCalls = getLogCalls();
    const hasResetFiltersEntry = logCalls.some(
      (call) =>
        typeof call[0] === 'string' &&
        call[0].includes(
          '[search][useSearchFilters][USE_SEARCH_FILTERS_HOOK][RESET_FILTERS][ENTRY]',
        ),
    );
    const hasResetFiltersExit = logCalls.some(
      (call) =>
        typeof call[0] === 'string' &&
        call[0].includes(
          '[search][useSearchFilters][USE_SEARCH_FILTERS_HOOK][RESET_FILTERS][EXIT]',
        ),
    );

    expect(hasResetFiltersEntry).toBe(true);
    expect(hasResetFiltersExit).toBe(true);
  });
});

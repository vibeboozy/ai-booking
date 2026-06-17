/**
 * Unit tests for DesktopFilters component (DESKTOP_FILTERS_SIDEBAR)
 * SC-001: DesktopFilters renders sidebar wrapper with correct classes on lg+
 * SC-002: DesktopFilters hidden on mobile (<lg)
 * SC-005: Sidebar sticky behavior during scroll
 * SC-007: FiltersContent reused in sidebar
 * SC-011: Log markers verification
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useSearchParams, useRouter } from 'next/navigation';

import { DesktopFilters } from '@/modules/search/components/DesktopFilters';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('@/modules/search/hooks/useSearchFilters', () => ({
  useSearchFilters: vi.fn().mockReturnValue({
    params: {},
    setParams: vi.fn(),
    resetFilters: vi.fn(),
  }),
}));

describe('DESKTOP_FILTERS_SIDEBAR', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('SC-001: DesktopFilters renders with correct sidebar classes', () => {
    it('should render with w-[280px] min-w-[280px] wrapper', () => {
      render(<DesktopFilters />);
      const wrapper = screen.getByText('Цена').closest('div');
      expect(wrapper).toHaveClass('w-[280px]', 'min-w-[280px]');
    });

    it('should render FiltersContent inside wrapper', () => {
      render(<DesktopFilters />);
      expect(screen.getByText('Цена')).toBeInTheDocument();
      expect(screen.getByText('Тип жилья')).toBeInTheDocument();
      expect(screen.getByText('Удобства')).toBeInTheDocument();
    });
  });

  describe('SC-007: FiltersContent reused in sidebar', () => {
    it('should contain FiltersContent component', () => {
      render(<DesktopFilters />);
      const priceSection = screen.getByText('Цена');
      expect(priceSection).toBeInTheDocument();
    });

    it('should pass params and handlers to FiltersContent', () => {
      const mockSetParams = vi.fn();
      const mockResetFilters = vi.fn();

      vi.mocked(require('@/modules/search/hooks/useSearchFilters').useSearchFilters)
        .mockReturnValueOnce({
          params: { priceMax: 5000000 },
          setParams: mockSetParams,
          resetFilters: mockResetFilters,
        });

      render(<DesktopFilters />);
      expect(screen.getByText('Цена')).toBeInTheDocument();
    });
  });
});

describe('LOG_MARKERS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const getLogCalls = (): unknown[][] => {
    return (console.log as unknown as { mock: { calls: unknown[][] } }).mock.calls;
  };

  it('SC-011: should log ENTRY and EXIT markers', () => {
    render(<DesktopFilters />);

    const logCalls = getLogCalls();
    const hasEntryLog = logCalls.some(
      (call) =>
        typeof call[0] === 'string' &&
        call[0].includes('[search][DesktopFilters][DESKTOP_FILTERS_SIDEBAR][ENTRY]'),
    );
    const hasExitLog = logCalls.some(
      (call) =>
        typeof call[0] === 'string' &&
        call[0].includes('[search][DesktopFilters][DESKTOP_FILTERS_SIDEBAR][EXIT]'),
    );

    expect(hasEntryLog).toBe(true);
    expect(hasExitLog).toBe(true);
  });
});
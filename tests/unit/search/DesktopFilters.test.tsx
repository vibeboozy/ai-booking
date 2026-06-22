/**
 * Unit tests for DesktopFilters component
 * SC-FEAT-005-001: DesktopFilters uses useSearchFilters hook
 * SC-FEAT-005-005: DesktopFilters log markers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { useSearchParams, useRouter } from 'next/navigation';

import { DesktopFilters } from '@/modules/search/components/DesktopFilters';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('@/modules/search/hooks/useSearchFilters', () => ({
  useSearchFilters: vi.fn(() => ({
    params: {},
    setParams: vi.fn(),
    clearParams: vi.fn(),
    resetFilters: vi.fn(),
  })),
}));

describe('DESKTOP_FILTERS', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);
    (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(
      new URLSearchParams(),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  const getLogCalls = (): unknown[][] => {
    return (console.log as unknown as { mock: { calls: unknown[][] } }).mock
      .calls;
  };

  describe('SC-FEAT-005-001: DesktopFilters uses useSearchFilters hook', () => {
    it('should call useSearchFilters hook', async () => {
      const { useSearchFilters } =
        await import('@/modules/search/hooks/useSearchFilters');

      render(<DesktopFilters />);

      expect(useSearchFilters).toHaveBeenCalled();
    });
  });

  describe('SC-FEAT-005-005: DesktopFilters log markers', () => {
    it('should log ENTRY marker', () => {
      render(<DesktopFilters />);

      const logCalls = getLogCalls();
      const hasEntryLog = logCalls.some(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes(
            '[search][DesktopFilters][DESKTOP_FILTERS_SIDEBAR][ENTRY]',
          ),
      );
      expect(hasEntryLog).toBe(true);
    });

    it('should log EXIT marker', () => {
      render(<DesktopFilters />);

      const logCalls = getLogCalls();
      const hasExitLog = logCalls.some(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes(
            '[search][DesktopFilters][DESKTOP_FILTERS_SIDEBAR][EXIT]',
          ),
      );
      expect(hasExitLog).toBe(true);
    });
  });
});

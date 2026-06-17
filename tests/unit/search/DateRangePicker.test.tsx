/**
 * Unit tests for DateRangePicker component
 * SC-FEAT-006-001: DateRangePicker renders children
 * SC-FEAT-006-005: DateRangePicker log markers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import { DateRangePicker } from '@/modules/search/components/DateRangePicker';

describe('DATE_RANGE_PICKER', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    cleanup();
  });

  const getLogCalls = (): unknown[][] => {
    return (console.log as unknown as { mock: { calls: unknown[][] } }).mock
      .calls;
  };

  describe('SC-FEAT-006-001: DateRangePicker renders children', () => {
    it('should render two date input buttons', () => {
      render(
        <DateRangePicker
          checkIn="2026-07-01"
          checkOut="2026-07-08"
          onSelect={vi.fn()}
        />,
      );

      expect(
        screen.getByRole('button', { name: /дата заезда/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /дата выезда/i }),
      ).toBeInTheDocument();
    });

    it('should render without className', () => {
      const { container } = render(
        <DateRangePicker
          checkIn="2026-07-01"
          checkOut="2026-07-08"
          onSelect={vi.fn()}
        />,
      );

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('SC-FEAT-006-005: DateRangePicker log markers', () => {
    it('should log ENTRY marker', () => {
      render(
        <DateRangePicker
          checkIn="2026-07-01"
          checkOut="2026-07-08"
          onSelect={vi.fn()}
        />,
      );

      const logCalls = getLogCalls();
      const hasEntryLog = logCalls.some(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes(
            '[search][DateRangePicker][SEARCH_DATE_RANGE_PICKER][ENTRY]',
          ),
      );
      expect(hasEntryLog).toBe(true);
    });
  });
});

/**
 * Unit tests for LocationAutocomplete component
 * SC-FEAT-004-001: LocationAutocomplete does not fetch when value.length < 2
 * SC-FEAT-004-006: LocationAutocomplete accessibility
 * SC-FEAT-004-009: LocationAutocomplete log markers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import { LocationAutocomplete } from '@/modules/search/components/LocationAutocomplete';

describe('LOCATION_AUTOCOMPLETE', () => {
  const mockOnChange = vi.fn();
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    cleanup();
  });

  const getLogCalls = (): unknown[][] => {
    return (console.log as unknown as { mock: { calls: unknown[][] } }).mock
      .calls;
  };

  describe('SC-FEAT-004-001: LocationAutocomplete does not fetch when value.length < 2', () => {
    it('should not open dropdown when value.length < 2', () => {
      render(
        <LocationAutocomplete
          value="С"
          onChange={mockOnChange}
          onSelect={mockOnSelect}
        />,
      );

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('should not show loading or results when value too short', () => {
      render(
        <LocationAutocomplete
          value="С"
          onChange={mockOnChange}
          onSelect={mockOnSelect}
        />,
      );

      expect(screen.queryByText('Загрузка...')).not.toBeInTheDocument();
      expect(screen.queryByText('Ничего не найдено')).not.toBeInTheDocument();
    });
  });

  describe('SC-FEAT-004-006: LocationAutocomplete accessibility', () => {
    it('should have role=combobox', () => {
      render(
        <LocationAutocomplete
          value=""
          onChange={mockOnChange}
          onSelect={mockOnSelect}
        />,
      );

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should have aria-haspopup=listbox', () => {
      render(
        <LocationAutocomplete
          value=""
          onChange={mockOnChange}
          onSelect={mockOnSelect}
        />,
      );

      expect(screen.getByRole('combobox')).toHaveAttribute(
        'aria-haspopup',
        'listbox',
      );
    });
  });

  describe('SC-FEAT-004-009: LocationAutocomplete log markers', () => {
    it('should log ENTRY marker on mount', () => {
      render(
        <LocationAutocomplete
          value=""
          onChange={mockOnChange}
          onSelect={mockOnSelect}
        />,
      );

      const logCalls = getLogCalls();
      const hasEntryLog = logCalls.some(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes(
            '[search][LocationAutocomplete][LOCATION_AUTOCOMPLETE_INPUT][ENTRY]',
          ),
      );
      expect(hasEntryLog).toBe(true);
    });

    it('should log EXIT marker on render', () => {
      render(
        <LocationAutocomplete
          value=""
          onChange={mockOnChange}
          onSelect={mockOnSelect}
        />,
      );

      const logCalls = getLogCalls();
      const hasExitLog = logCalls.some(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes(
            '[search][LocationAutocomplete][LOCATION_AUTOCOMPLETE_INPUT][EXIT]',
          ),
      );
      expect(hasExitLog).toBe(true);
    });
  });
});

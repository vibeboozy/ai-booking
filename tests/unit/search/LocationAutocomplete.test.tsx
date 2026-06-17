/**
 * Unit tests for LocationAutocomplete component
 * SC-004 to SC-013: LocationAutocomplete functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';

import { LocationAutocomplete } from '@/modules/search/components/LocationAutocomplete';

const mockLocations = [
  { id: '1', name: 'Сочи', type: 'city' as const, slug: 'sochi', lat: 43.6, lng: 39.7 },
  { id: '2', name: 'Москва', type: 'city' as const, slug: 'moscow', lat: 55.75, lng: 37.62 },
  { id: '3', name: 'Россия', type: 'country' as const, slug: 'russia' },
];

global.fetch = vi.fn();

describe('LOCATION_AUTOCOMPLETE_INPUT', () => {
  const mockOnChange = vi.fn();
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  describe('SC-004: LocationAutocomplete triggers after 2+ chars', () => {
    it('should show dropdown when user types 2+ characters', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockLocations }),
      });

      render(
        <LocationAutocomplete
          value=""
          onChange={mockOnChange}
          onSelect={mockOnSelect}
        />,
      );

      const input = screen.getAllByRole('combobox')[0];
      fireEvent.change(input, { target: { value: 'Со' } });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('SC-005: LocationAutocomplete hidden with 1 char', () => {
    it('should not show dropdown when user types only 1 character', () => {
      render(
        <LocationAutocomplete
          value=""
          onChange={mockOnChange}
          onSelect={mockOnSelect}
        />,
      );

      const input = screen.getAllByRole('combobox')[0];
      fireEvent.change(input, { target: { value: 'С' } });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('SC-006: LocationAutocomplete click fills input', () => {
    it('should fill input and close dropdown when user clicks a result', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockLocations[0]] }),
      });

      render(
        <LocationAutocomplete
          value=""
          onChange={mockOnChange}
          onSelect={mockOnSelect}
        />,
      );

      const input = screen.getAllByRole('combobox')[0];
      fireEvent.change(input, { target: { value: 'Со' } });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      const option = screen.getByText('Сочи');
      fireEvent.click(option);

      expect(mockOnChange).toHaveBeenCalledWith('Сочи');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('SC-007: LocationAutocomplete keyboard navigation - ArrowDown', () => {
    it('should highlight second item when ArrowDown is pressed', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockLocations }),
      });

      render(
        <LocationAutocomplete
          value=""
          onChange={mockOnChange}
          onSelect={mockOnSelect}
        />,
      );

      const input = screen.getAllByRole('combobox')[0];
      fireEvent.change(input, { target: { value: 'М' } });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });

      const listbox = screen.getByRole('listbox');
      const options = listbox.querySelectorAll('li');
      expect(options[1]).toHaveClass('bg-muted');
    });
  });

  describe('SC-008: LocationAutocomplete keyboard - Enter selects', () => {
    it('should select highlighted item when Enter is pressed', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockLocations }),
      });

      render(
        <LocationAutocomplete
          value=""
          onChange={mockOnChange}
          onSelect={mockOnSelect}
        />,
      );

      const input = screen.getAllByRole('combobox')[0];
      fireEvent.change(input, { target: { value: 'М' } });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnChange).toHaveBeenCalledWith('Москва');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('SC-009: LocationAutocomplete Esc closes dropdown', () => {
    it('should close dropdown when Escape is pressed', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockLocations }),
      });

      render(
        <LocationAutocomplete
          value=""
          onChange={mockOnChange}
          onSelect={mockOnSelect}
        />,
      );

      const input = screen.getAllByRole('combobox')[0];
      fireEvent.change(input, { target: { value: 'М' } });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      expect(screen.getByRole('listbox')).toBeInTheDocument();

      fireEvent.keyDown(input, { key: 'Escape' });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('SC-010: LocationAutocomplete - no results message', () => {
    it('should show "Ничего не найдено" when API returns empty array', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      render(
        <LocationAutocomplete
          value=""
          onChange={mockOnChange}
          onSelect={mockOnSelect}
        />,
      );

      const input = screen.getAllByRole('combobox')[0];
      fireEvent.change(input, { target: { value: 'xyz' } });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      expect(screen.getByText('Ничего не найдено')).toBeInTheDocument();
    });
  });

  describe('SC-011: LocationAutocomplete - fetch error silently handled', () => {
    it('should hide dropdown when fetch fails', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error'),
      );

      render(
        <LocationAutocomplete
          value=""
          onChange={mockOnChange}
          onSelect={mockOnSelect}
        />,
      );

      const input = screen.getAllByRole('combobox')[0];
      fireEvent.change(input, { target: { value: 'Со' } });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('SC-012: LocationAutocomplete - debounce 300ms', () => {
    it('should only fetch once after rapid typing', async () => {
      const fetchSpy = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockLocations[0]] }),
      });
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(fetchSpy);

      render(
        <LocationAutocomplete
          value=""
          onChange={mockOnChange}
          onSelect={mockOnSelect}
        />,
      );

      const input = screen.getAllByRole('combobox')[0];

      fireEvent.change(input, { target: { value: 'С' } });
      fireEvent.change(input, { target: { value: 'Со' } });
      fireEvent.change(input, { target: { value: 'Соч' } });

      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('SC-013: LocationAutocomplete - abort previous request', () => {
    it('should abort previous request when new query is made', async () => {
      const abortSpy = vi.fn();
      const originalAbortController = global.AbortController;

      global.AbortController = vi.fn(() => ({
        signal: { aborted: false },
        abort: abortSpy,
      })) as unknown as typeof AbortController;

      const fetchSpy = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockLocations }),
      });
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(fetchSpy);

      render(
        <LocationAutocomplete
          value=""
          onChange={mockOnChange}
          onSelect={mockOnSelect}
        />,
      );

      const input = screen.getAllByRole('combobox')[0];

      fireEvent.change(input, { target: { value: 'М' } });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });

      fireEvent.change(input, { target: { value: 'Мо' } });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(300);
      });

      expect(abortSpy).toHaveBeenCalled();

      global.AbortController = originalAbortController;
    });
  });
});

describe('LOG_MARKERS', () => {
  const mockOnChange = vi.fn();
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('SC-021-001: should log ENTRY marker on mount', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    render(
      <LocationAutocomplete
        value=""
        onChange={mockOnChange}
        onSelect={mockOnSelect}
      />,
    );

    const logCalls = (console.log as unknown as { mock: { calls: string[][] } }).mock.calls;
    const hasEntryLog = logCalls.some(
      (call) => call[0]?.includes('[search][LocationAutocomplete][LOCATION_AUTOCOMPLETE_INPUT][ENTRY]'),
    );
    expect(hasEntryLog).toBe(true);
  });

  it('SC-021-002: should log EXIT marker after initial render', () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [] }),
    });

    render(
      <LocationAutocomplete
        value=""
        onChange={mockOnChange}
        onSelect={mockOnSelect}
      />,
    );

    const logCalls = (console.log as unknown as { mock: { calls: string[][] } }).mock.calls;
    const hasExitLog = logCalls.some(
      (call) => call[0]?.includes('[search][LocationAutocomplete][LOCATION_AUTOCOMPLETE_INPUT][EXIT]'),
    );
    expect(hasExitLog).toBe(true);
  });
});
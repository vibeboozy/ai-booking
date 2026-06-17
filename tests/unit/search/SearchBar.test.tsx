/**
 * Unit tests for SearchBar component
 * SC-001 to SC-003, SC-014 to SC-016: SearchBar functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';

import { SearchBar } from '@/modules/search/components/SearchBar';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

const mockPush = vi.fn();

describe('SEARCH_BAR_COMPONENT', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('SC-001: SearchBar renders all form fields', () => {
    it('should render location input, date pickers, and submit button', () => {
      render(<SearchBar />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByLabelText('Заезд')).toBeInTheDocument();
      expect(screen.getByLabelText('Выезд')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /найти/i })).toBeInTheDocument();
    });
  });

  describe('SC-002: SearchBar submit with valid data navigates to search page', () => {
    it('should call router.push with correct URL params when form is submitted', async () => {
      render(<SearchBar />);

      act(() => {
        vi.runAllTimers();
      });

      const inputs = screen.getAllByRole('combobox');
      const input = inputs[0];
      fireEvent.change(input, { target: { value: 'Сочи' } });

      const checkInInput = screen.getByLabelText('Заезд');
      fireEvent.change(checkInInput, { target: { value: '2026-07-01' } });

      const checkOutInput = screen.getByLabelText('Выезд');
      fireEvent.change(checkOutInput, { target: { value: '2026-07-08' } });

      const submitButton = screen.getAllByRole('button', { name: /найти/i })[0];
      fireEvent.click(submitButton);

      await act(async () => {
        vi.runAllTimers();
      });

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/search'),
      );
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('city='),
      );
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('checkIn=2026-07-01'),
      );
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('checkOut=2026-07-08'),
      );
    });
  });

  describe('SC-003: Progressive enhancement - form submits without JS', () => {
    it('should have form with action="/search" and method="get"', () => {
      render(<SearchBar />);

      const forms = document.querySelectorAll('form');
      expect(forms.length).toBeGreaterThan(0);
      expect(forms[0].method).toBe('get');
      expect(forms[0].action).toContain('/search');
    });
  });

  describe('SC-014: checkOut validation - must be after checkIn', () => {
    it('should show validation error when checkOut <= checkIn', async () => {
      render(<SearchBar />);

      act(() => {
        vi.runAllTimers();
      });

      const checkInInput = screen.getByLabelText('Заезд');
      fireEvent.change(checkInInput, { target: { value: '2026-07-10' } });

      const checkOutInput = screen.getByLabelText('Выезд');
      fireEvent.change(checkOutInput, { target: { value: '2026-07-08' } });

      act(() => {
        vi.runAllTimers();
      });

      const submitButton = screen.getAllByRole('button', { name: /найти/i })[0];
      fireEvent.click(submitButton);

      await act(async () => {
        vi.runAllTimers();
      });

      const alertElement = await screen.findByRole('alert');
      expect(alertElement).toHaveTextContent(
        'Дата выезда должна быть позже даты заезда',
      );
    });

    it('should not show error when checkOut > checkIn', async () => {
      render(<SearchBar />);

      act(() => {
        vi.runAllTimers();
      });

      const checkInInput = screen.getByLabelText('Заезд');
      fireEvent.change(checkInInput, { target: { value: '2026-07-01' } });

      const checkOutInput = screen.getByLabelText('Выезд');
      fireEvent.change(checkOutInput, { target: { value: '2026-07-08' } });

      act(() => {
        vi.runAllTimers();
      });

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});

describe('LOG_MARKERS', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('SC-020-001: should log ENTRY marker on mount', () => {
    render(<SearchBar />);

    const hasEntryLog = (console.log as unknown as { mock: { calls: string[][] } }).mock.calls.some(
      (call) => call[0]?.includes('[search][SearchBar][SEARCH_BAR_COMPONENT][ENTRY]'),
    );
    expect(hasEntryLog).toBe(true);
  });

  it('SC-020-002: should log EXIT marker after render', () => {
    render(<SearchBar />);

    const hasExitLog = (console.log as unknown as { mock: { calls: string[][] } }).mock.calls.some(
      (call) => call[0]?.includes('[search][SearchBar][SEARCH_BAR_COMPONENT][EXIT]'),
    );
    expect(hasExitLog).toBe(true);
  });
});
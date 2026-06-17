/**
 * Unit tests for SearchBar component
 * SC-FEAT-003-001: SearchBar renders LocationAutocomplete, DateRangePicker, guest counter
 * SC-FEAT-003-004: SearchBar guest counter increments/decrements within bounds
 * SC-FEAT-003-006: SearchBar log markers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';

import { SearchBar } from '@/modules/search/components/SearchBar';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

describe('SEARCH_BAR', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
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
    vi.useRealTimers();
    cleanup();
  });

  const getLogCalls = (): unknown[][] => {
    return (console.log as unknown as { mock: { calls: unknown[][] } }).mock
      .calls;
  };

  describe('SC-FEAT-003-001: SearchBar renders LocationAutocomplete, DateRangePicker, guest counter', () => {
    it('should render LocationAutocomplete', () => {
      render(<SearchBar />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render DateRangePicker with Дата заезда button', () => {
      render(<SearchBar />);
      expect(
        screen.getByRole('button', { name: /дата заезда/i }),
      ).toBeInTheDocument();
    });

    it('should render DateRangePicker with Дата выезда button', () => {
      render(<SearchBar />);
      expect(
        screen.getByRole('button', { name: /дата выезда/i }),
      ).toBeInTheDocument();
    });

    it('should render guest counter with +/- buttons', () => {
      render(<SearchBar />);
      expect(
        screen.getByRole('button', { name: /уменьшить/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /увеличить/i }),
      ).toBeInTheDocument();
    });

    it('should render "Найти" submit button', () => {
      render(<SearchBar />);
      expect(screen.getByRole('button', { name: 'Найти' })).toBeInTheDocument();
    });

    it('should have form with action="/search" method="get"', () => {
      render(<SearchBar />);
      const form = document.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form?.getAttribute('action')).toBe('/search');
      expect(form?.getAttribute('method')).toBe('get');
    });

    it('should have hidden input for guests', () => {
      render(<SearchBar />);
      const hiddenGuestsInput = document.querySelector(
        'input[type="hidden"][name="guests"]',
      );
      expect(hiddenGuestsInput).toBeInTheDocument();
    });

    it('should display default guest count of 2', () => {
      render(<SearchBar />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('SC-FEAT-003-004: SearchBar guest counter increments/decrements within bounds', () => {
    it('should increment guest count when + button clicked', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<SearchBar />);

      const incrementButton = screen.getByRole('button', {
        name: /увеличить/i,
      });
      await user.click(incrementButton);

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should decrement guest count when - button clicked', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<SearchBar />);

      const decrementButton = screen.getByRole('button', {
        name: /уменьшить/i,
      });
      await user.click(decrementButton);

      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should disable decrement button when guests at 1', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<SearchBar />);

      const decrementButton = screen.getByRole('button', {
        name: /уменьшить/i,
      });
      await user.click(decrementButton);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(decrementButton).toBeDisabled();
    });

    it('should disable increment button when guests at 16', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<SearchBar />);

      const incrementButton = screen.getByRole('button', {
        name: /увеличить/i,
      });
      for (let i = 0; i < 14; i++) {
        await user.click(incrementButton);
      }

      expect(screen.getByText('16')).toBeInTheDocument();
      expect(incrementButton).toBeDisabled();
    });
  });

  describe('SC-FEAT-003-006: SearchBar log markers', () => {
    it('should log ENTRY marker on mount', () => {
      render(<SearchBar />);

      const logCalls = getLogCalls();
      const hasEntryLog = logCalls.some(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes('[search][SearchBar][SEARCH_BAR_COMPONENT][ENTRY]'),
      );
      expect(hasEntryLog).toBe(true);
    });

    it('should log EXIT marker on render', () => {
      render(<SearchBar />);

      const logCalls = getLogCalls();
      const hasExitLog = logCalls.some(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes('[search][SearchBar][SEARCH_BAR_COMPONENT][EXIT]'),
      );
      expect(hasExitLog).toBe(true);
    });

    it('should log DECISION marker on increment guests', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<SearchBar />);

      const incrementButton = screen.getByRole('button', {
        name: /увеличить/i,
      });
      await user.click(incrementButton);

      const logCalls = getLogCalls();
      const hasIncrementLog = logCalls.some(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes(
            '[search][SearchBar][SEARCH_BAR_COMPONENT][DECISION]',
          ) &&
          JSON.stringify(call[1]).includes('increment guests'),
      );
      expect(hasIncrementLog).toBe(true);
    });

    it('should log DECISION marker on decrement guests', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      render(<SearchBar />);

      const decrementButton = screen.getByRole('button', {
        name: /уменьшить/i,
      });
      await user.click(decrementButton);

      const logCalls = getLogCalls();
      const hasDecrementLog = logCalls.some(
        (call) =>
          typeof call[0] === 'string' &&
          call[0].includes(
            '[search][SearchBar][SEARCH_BAR_COMPONENT][DECISION]',
          ) &&
          JSON.stringify(call[1]).includes('decrement guests'),
      );
      expect(hasDecrementLog).toBe(true);
    });
  });

  describe('ARIA attributes', () => {
    it('should have aria-label on guest decrement button', () => {
      render(<SearchBar />);
      expect(
        screen.getByRole('button', { name: /уменьшить количество гостей/i }),
      ).toBeInTheDocument();
    });

    it('should have aria-label on guest increment button', () => {
      render(<SearchBar />);
      expect(
        screen.getByRole('button', { name: /увеличить количество гостей/i }),
      ).toBeInTheDocument();
    });

    it('should have aria-live on guest count span', () => {
      render(<SearchBar />);
      expect(screen.getByText('2')).toHaveAttribute('aria-live', 'polite');
    });
  });
});

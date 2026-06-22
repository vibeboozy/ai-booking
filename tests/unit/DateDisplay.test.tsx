/**
 * ANCHOR: booking
 * PURPOSE: Unit-тесты DateDisplay — валидация выбора дат в модальном окне.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DateDisplay } from '@/modules/booking/components/DateDisplay';
import { Modal } from '@/shared/ui/modal';
import * as nextNavigation from 'next/navigation';

const mockUseAvailability = vi.fn();
vi.mock('@/modules/listing/hooks/useAvailability', () => ({
  useAvailability: (...args: unknown[]) => mockUseAvailability(...args),
}));

vi.mock('@/shared/ui/modal', () => ({
  Modal: vi.fn(({ isOpen, children }) =>
    isOpen ? <div data-testid="modal">{children}</div> : null,
  ),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockReplace = vi.fn();

function createMockDays(
  year: number,
  month: number,
): Array<{ date: string; status: 'free' | 'booked' | 'past' }> {
  const days: Array<{ date: string; status: 'free' | 'booked' | 'past' }> = [];
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const date = new Date(Date.UTC(year, month, d));
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const past = date < today;
    days.push({
      date: dateStr,
      status: past ? 'past' : 'free',
    });
  }
  return days;
}

function getFutureDate(daysFromNow: number): Date {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  return date;
}

function toLocalDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getFutureClickableDates(container: HTMLElement): HTMLElement[] {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const buttons = container.querySelectorAll('[role="button"]');
  return Array.from(buttons).filter((btn) => {
    const text = btn.textContent;
    if (!text) return false;
    const day = parseInt(text, 10);
    if (isNaN(day)) return false;
    const date = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), day),
    );
    return date >= today;
  }) as HTMLElement[];
}

describe('DateDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAvailability.mockReset();

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    mockUseAvailability.mockReturnValue({
      days: createMockDays(year, month),
      isLoading: false,
      error: undefined,
    });

    vi.spyOn(nextNavigation, 'useRouter').mockReturnValue({
      replace: mockReplace,
      push: vi.fn(),
    } as unknown as ReturnType<typeof nextNavigation.useRouter>);
  });

  it('renders placeholder when no dates selected', () => {
    vi.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(
      new URLSearchParams() as unknown as nextNavigation.ReadonlyURLSearchParams,
    );

    render(<DateDisplay listingId="test-id" />);
    expect(screen.getByText('Даты не выбраны')).toBeInTheDocument();
  });

  it('renders selected dates when provided in URL', () => {
    const checkIn = getFutureDate(5);
    const checkOut = getFutureDate(10);

    vi.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(
      new URLSearchParams(
        `checkIn=${toLocalDateString(checkIn)}&checkOut=${toLocalDateString(checkOut)}`,
      ) as unknown as nextNavigation.ReadonlyURLSearchParams,
    );

    render(<DateDisplay listingId="test-id" />);
    expect(screen.getByText('Изменить')).toBeInTheDocument();
  });

  it('opens modal when clicking change button', async () => {
    const checkIn = getFutureDate(5);
    const checkOut = getFutureDate(10);

    vi.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(
      new URLSearchParams(
        `checkIn=${toLocalDateString(checkIn)}&checkOut=${toLocalDateString(checkOut)}`,
      ) as unknown as nextNavigation.ReadonlyURLSearchParams,
    );

    render(<DateDisplay listingId="test-id" />);

    const changeBtn = document.querySelector(
      '.bg-white.rounded-xl.border button',
    );
    if (changeBtn) {
      fireEvent.click(changeBtn);
    }

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });
});

describe('DateDisplay handleDateSelect integration', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    vi.clearAllMocks();

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    mockUseAvailability.mockReturnValue({
      days: createMockDays(year, month),
      isLoading: false,
      error: undefined,
    });
  });

  it('opens modal when clicking change button', async () => {
    const checkIn = getFutureDate(5);
    const checkOut = getFutureDate(10);

    vi.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(
      new URLSearchParams(
        `checkIn=${toLocalDateString(checkIn)}&checkOut=${toLocalDateString(checkOut)}`,
      ) as unknown as nextNavigation.ReadonlyURLSearchParams,
    );

    const { unmount } = render(<DateDisplay listingId="test-id" />);

    const changeBtn = screen.getAllByText('Изменить')[0];
    fireEvent.click(changeBtn);

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    unmount();
  });

  it('calendar is rendered inside modal when opened', async () => {
    const checkIn = getFutureDate(5);
    const checkOut = getFutureDate(10);

    vi.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(
      new URLSearchParams(
        `checkIn=${toLocalDateString(checkIn)}&checkOut=${toLocalDateString(checkOut)}`,
      ) as unknown as nextNavigation.ReadonlyURLSearchParams,
    );

    const { unmount } = render(<DateDisplay listingId="test-id" />);

    const changeBtn = screen.getAllByText('Изменить')[0];
    fireEvent.click(changeBtn);

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    const calendarContainer = screen
      .getByTestId('modal')
      .querySelector('[class*="rounded-xl border"]');
    expect(calendarContainer).toBeInTheDocument();

    unmount();
  });

  it('clicking first date shows check-out prompt', async () => {
    const checkIn = getFutureDate(5);
    const checkOut = getFutureDate(10);

    vi.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(
      new URLSearchParams(
        `checkIn=${toLocalDateString(checkIn)}&checkOut=${toLocalDateString(checkOut)}`,
      ) as unknown as nextNavigation.ReadonlyURLSearchParams,
    );

    const { unmount } = render(<DateDisplay listingId="test-id" />);

    const changeBtn = screen.getAllByText('Изменить')[0];
    fireEvent.click(changeBtn);

    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    const modal = screen.getByTestId('modal');
    const clickableDates = getFutureClickableDates(modal);

    if (clickableDates.length > 0) {
      fireEvent.click(clickableDates[0]);

      await waitFor(() => {
        expect(screen.queryByText('Выберите дату выезда')).toBeInTheDocument();
      });
    }

    unmount();
  });
});

/**
 * ANCHOR: listing
 * PURPOSE: Unit-тесты ListingDateSelector — валидация URL-дат, доступность.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { ListingDateSelector } from '@/modules/listing/components/ListingDateSelector';
import * as nextNavigation from 'next/navigation';

const mockUseAvailability = vi.fn();
vi.mock('@/modules/listing/hooks/useAvailability', () => ({
  useAvailability: (...args: unknown[]) => mockUseAvailability(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockReplace = vi.fn();
const mockPush = vi.fn();

function createMockDays(
  bookedDates: string[],
  pastDates: string[] = [],
): Array<{ date: string; status: 'free' | 'booked' | 'past' }> {
  const days: Array<{ date: string; status: 'free' | 'booked' | 'past' }> = [];
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  for (let d = 1; d <= 28; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    let status: 'free' | 'booked' | 'past' = 'free';
    if (pastDates.includes(dateStr)) status = 'past';
    else if (bookedDates.includes(dateStr)) status = 'booked';
    days.push({ date: dateStr, status });
  }
  return days;
}

describe('ListingDateSelector URL date validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAvailability.mockReset();
    vi.spyOn(nextNavigation, 'useRouter').mockReturnValue({
      replace: mockReplace,
      push: mockPush,
    } as unknown as ReturnType<typeof nextNavigation.useRouter>);
    vi.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(
      new URLSearchParams() as unknown as nextNavigation.ReadonlyURLSearchParams,
    );
    mockUseAvailability.mockReturnValue({
      days: createMockDays([]),
      isLoading: false,
      error: undefined,
    });
  });

  it('renders calendar without errors when no dates in URL', async () => {
    render(<ListingDateSelector listingId="test-id" />);
    expect(
      document.querySelector('.bg-white.rounded-xl.border'),
    ).toBeInTheDocument();
  });

  it('shows validation error when URL dates are booked', async () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    // Use future dates (25th and 27th) to avoid "dates in the past" error
    const checkIn = `${year}-${String(month + 1).padStart(2, '0')}-25`;
    const checkOut = `${year}-${String(month + 1).padStart(2, '0')}-27`;

    // Mark these dates as booked
    mockUseAvailability.mockReturnValue({
      days: createMockDays([checkIn, checkOut]),
      isLoading: false,
      error: undefined,
    });

    vi.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(
      new URLSearchParams(
        `checkIn=${checkIn}&checkOut=${checkOut}`,
      ) as unknown as nextNavigation.ReadonlyURLSearchParams,
    );

    render(<ListingDateSelector listingId="test-id" />);

    await waitFor(() => {
      expect(
        screen.getByText('Выбранные даты недоступны для бронирования'),
      ).toBeInTheDocument();
    });
  });

  it('clears URL params when dates are booked', async () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    // Use future dates (25th and 27th) to avoid "dates in the past" error
    const checkIn = `${year}-${String(month + 1).padStart(2, '0')}-25`;
    const checkOut = `${year}-${String(month + 1).padStart(2, '0')}-27`;

    mockUseAvailability.mockReturnValue({
      days: createMockDays([checkIn, checkOut]),
      isLoading: false,
      error: undefined,
    });

    vi.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(
      new URLSearchParams(
        `checkIn=${checkIn}&checkOut=${checkOut}`,
      ) as unknown as nextNavigation.ReadonlyURLSearchParams,
    );

    render(<ListingDateSelector listingId="test-id" />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
      const replaceCall = mockReplace.mock.calls[0];
      const params = new URLSearchParams(replaceCall[0].split('?')[1]);
      expect(params.get('checkIn')).toBeNull();
      expect(params.get('checkOut')).toBeNull();
    });
  });

  it('does not show validation error when URL dates are free', async () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    // Use days 26 and 28 to avoid:
    // 1. Past dates (today is 16th)
    // 2. Booked dates (d % 5 === 0 marks days 5, 10, 15, 20, 25 as booked)
    const checkIn = `${year}-${String(month + 1).padStart(2, '0')}-26`;
    const checkOut = `${year}-${String(month + 1).padStart(2, '0')}-28`;

    mockUseAvailability.mockReturnValue({
      days: createMockDays([]),
      isLoading: false,
      error: undefined,
    });

    vi.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(
      new URLSearchParams(
        `checkIn=${checkIn}&checkOut=${checkOut}`,
      ) as unknown as nextNavigation.ReadonlyURLSearchParams,
    );

    render(<ListingDateSelector listingId="test-id" />);

    await waitFor(() => {
      expect(screen.queryByText('Забронировать')).toBeInTheDocument();
    });
  });

  it('shows validation error when URL dates are in the past', async () => {
    const pastCheckIn = '2020-01-01';
    const pastCheckOut = '2020-01-03';

    vi.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(
      new URLSearchParams(
        `checkIn=${pastCheckIn}&checkOut=${pastCheckOut}`,
      ) as unknown as nextNavigation.ReadonlyURLSearchParams,
    );

    render(<ListingDateSelector listingId="test-id" />);

    await waitFor(() => {
      expect(
        screen.getAllByText('Выбранные даты уже прошли').length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  it('clears URL params when dates are in the past', async () => {
    const pastCheckIn = '2020-01-01';
    const pastCheckOut = '2020-01-03';

    vi.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(
      new URLSearchParams(
        `checkIn=${pastCheckIn}&checkOut=${pastCheckOut}`,
      ) as unknown as nextNavigation.ReadonlyURLSearchParams,
    );

    render(<ListingDateSelector listingId="test-id" />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });
  });

  it('shows book button when valid dates are selected', async () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    // Use future dates (26th and 28th) to avoid:
    // 1. "dates in the past" error (today is 16th)
    // 2. Booked dates (d % 5 === 0 marks days 5, 10, 15, 20, 25 as booked)
    const checkIn = `${year}-${String(month + 1).padStart(2, '0')}-26`;
    const checkOut = `${year}-${String(month + 1).padStart(2, '0')}-28`;

    mockUseAvailability.mockReturnValue({
      days: createMockDays([]),
      isLoading: false,
      error: undefined,
    });

    vi.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(
      new URLSearchParams(
        `checkIn=${checkIn}&checkOut=${checkOut}`,
      ) as unknown as nextNavigation.ReadonlyURLSearchParams,
    );

    render(<ListingDateSelector listingId="test-id" />);

    await waitFor(() => {
      expect(
        screen.getAllByText('Забронировать').length,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  it('shows validation error when checkIn is after checkOut', async () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    // checkIn is LATER than checkOut (inverted dates)
    const checkIn = `${year}-${String(month + 1).padStart(2, '0')}-28`;
    const checkOut = `${year}-${String(month + 1).padStart(2, '0')}-26`;

    mockUseAvailability.mockReturnValue({
      days: createMockDays([]),
      isLoading: false,
      error: undefined,
    });

    vi.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(
      new URLSearchParams(
        `checkIn=${checkIn}&checkOut=${checkOut}`,
      ) as unknown as nextNavigation.ReadonlyURLSearchParams,
    );

    render(<ListingDateSelector listingId="test-id" />);

    await waitFor(() => {
      expect(
        screen.getByText('Дата выезда должна быть позже даты заезда'),
      ).toBeInTheDocument();
    });
  });

  it('clears URL params when checkIn equals checkOut', async () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const sameDay = `${year}-${String(month + 1).padStart(2, '0')}-26`;

    mockUseAvailability.mockReturnValue({
      days: createMockDays([]),
      isLoading: false,
      error: undefined,
    });

    vi.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(
      new URLSearchParams(
        `checkIn=${sameDay}&checkOut=${sameDay}`,
      ) as unknown as nextNavigation.ReadonlyURLSearchParams,
    );

    render(<ListingDateSelector listingId="test-id" />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
      const replaceCall = mockReplace.mock.calls[0];
      const params = new URLSearchParams(replaceCall[0].split('?')[1]);
      expect(params.get('checkIn')).toBeNull();
      expect(params.get('checkOut')).toBeNull();
    });
  });
});

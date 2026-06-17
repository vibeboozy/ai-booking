/**
 * ANCHOR: booking
 * PURPOSE: Unit-тесты CheckoutForm — валидация дат, доступность, ошибки.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CheckoutForm } from '@/modules/booking/components/CheckoutForm';
import * as nextNavigation from 'next/navigation';

const mockUseAvailability = vi.fn();
vi.mock('@/modules/listing/hooks/useAvailability', () => ({
  useAvailability: (...args: unknown[]) => mockUseAvailability(...args),
}));

const mockUseCheckout = vi.fn();
vi.mock('@/modules/booking/hooks/useCheckout', () => ({
  useCheckout: (...args: unknown[]) => mockUseCheckout(...args),
}));

vi.mock('@/modules/booking/components/DateDisplay', () => ({
  DateDisplay: vi.fn(() => <div data-testid="date-display">DateDisplay</div>),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

function createMockDays(
  bookedDates: string[],
  pastDates: string[] = [],
): { date: string; status: 'free' | 'booked' | 'past' }[] {
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

const mockListing = {
  id: 'listing-123',
  title: 'Тестовая квартира',
  city: 'Москва',
  country: 'Россия',
  pricePerNight: 500000,
  images: ['https://example.com/image.jpg'],
  averageRating: 4.5,
  reviewCount: 10,
  propertyType: 'apartment' as const,
  description: 'Отличная квартира',
  amenities: ['wifi', 'kitchen'],
  lat: 55.755,
  lng: 37.617,
  cleaningFee: 10000,
  serviceFee: 5000,
  host: { id: 'host-1', name: 'Иван', avatarUrl: null },
};

function setupMockUseCheckout(overrides = {}) {
  const defaults = {
    checkIn: null,
    checkOut: null,
    guests: 2,
    breakdown: null,
    validationError: null,
    setGuests: vi.fn(),
    submit: vi.fn().mockResolvedValue(null),
    isSubmitting: false,
    ...overrides,
  };
  mockUseCheckout.mockReturnValue(defaults);
}

function setupMockAvailability(
  days: { date: string; status: 'free' | 'booked' | 'past' }[] = [],
) {
  mockUseAvailability.mockReturnValue({
    days,
    isLoading: false,
    error: undefined,
  });
}

describe('CheckoutForm date validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockAvailability(createMockDays([]));
    vi.spyOn(nextNavigation, 'useSearchParams').mockReturnValue(
      new URLSearchParams() as unknown as nextNavigation.ReadonlyURLSearchParams,
    );
  });

  it('renders without errors when loading', () => {
    setupMockUseCheckout();
    setupMockAvailability([]);

    render(<CheckoutForm listing={mockListing} />);
    expect(screen.getByText('Тестовая квартира')).toBeInTheDocument();
  });

  it('shows error when dates are in the past', async () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const checkIn = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const checkOut = `${year}-${String(month + 1).padStart(2, '0')}-03`;

    setupMockUseCheckout({
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      breakdown: {
        nights: 2,
        subtotal: 1000000,
        cleaningFee: 10000,
        serviceFee: 5000,
        total: 1015000,
      },
      validationError: 'Выбранные даты уже прошли',
    });

    render(<CheckoutForm listing={mockListing} />);

    await waitFor(() => {
      expect(screen.getByText('Выбранные даты уже прошли')).toBeInTheDocument();
    });
  });

  it('shows error when dates are booked', async () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    // Use future dates (25th and 27th) to avoid "dates in the past" error
    const checkIn = `${year}-${String(month + 1).padStart(2, '0')}-25`;
    const checkOut = `${year}-${String(month + 1).padStart(2, '0')}-27`;

    setupMockUseCheckout({
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      breakdown: {
        nights: 2,
        subtotal: 1000000,
        cleaningFee: 10000,
        serviceFee: 5000,
        total: 1015000,
      },
      validationError: 'Выбранные даты недоступны для бронирования',
    });

    setupMockAvailability(createMockDays([checkIn, checkOut]));

    render(<CheckoutForm listing={mockListing} />);

    await waitFor(() => {
      expect(
        screen.getByText('Выбранные даты недоступны для бронирования'),
      ).toBeInTheDocument();
    });
  });

  it('shows error when checkIn is after checkOut', async () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const checkIn = `${year}-${String(month + 1).padStart(2, '0')}-20`;
    const checkOut = `${year}-${String(month + 1).padStart(2, '0')}-18`;

    setupMockUseCheckout({
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      validationError: 'Дата выезда должна быть позже даты заезда',
    });

    render(<CheckoutForm listing={mockListing} />);

    await waitFor(() => {
      expect(
        screen.getByText('Дата выезда должна быть позже даты заезда'),
      ).toBeInTheDocument();
    });
  });

  it('does not show confirm button when validation error exists', async () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const checkIn = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const checkOut = `${year}-${String(month + 1).padStart(2, '0')}-03`;

    setupMockUseCheckout({
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      breakdown: {
        nights: 2,
        subtotal: 1000000,
        cleaningFee: 10000,
        serviceFee: 5000,
        total: 1015000,
      },
      validationError: 'Выбранные даты уже прошли',
    });

    render(<CheckoutForm listing={mockListing} />);

    await waitFor(() => {
      const buttons = screen.queryAllByText('Подтвердить бронирование');
      expect(buttons.length).toBe(0);
    });
  });

  it('shows confirm button when dates are valid', async () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const checkIn = `${year}-${String(month + 1).padStart(2, '0')}-26`;
    const checkOut = `${year}-${String(month + 1).padStart(2, '0')}-28`;

    setupMockUseCheckout({
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      breakdown: {
        nights: 2,
        subtotal: 1000000,
        cleaningFee: 10000,
        serviceFee: 5000,
        total: 1015000,
      },
      validationError: null,
    });

    render(<CheckoutForm listing={mockListing} />);

    await waitFor(() => {
      const buttons = screen.getAllByText('Подтвердить бронирование');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});

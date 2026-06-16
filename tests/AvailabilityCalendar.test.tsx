/**
 * ANCHOR: listing
 * PURPOSE: Unit-тесты AvailabilityCalendar — рендеринг, навигация, выбор дат.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AvailabilityCalendar } from '@/modules/listing/components/AvailabilityCalendar';

const mockUseAvailability = vi.fn();
vi.mock('@/modules/listing/hooks/useAvailability', () => ({
  useAvailability: (...args: unknown[]) => mockUseAvailability(...args),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

function createMockDays(
  year: number,
  month: number,
): Array<{ date: string; status: 'free' | 'booked' | 'past' }> {
  const days: Array<{ date: string; status: 'free' | 'booked' | 'past' }> = [];
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const past = new Date(dateStr) < new Date();
    days.push({
      date: dateStr,
      status: past ? 'past' : d % 5 === 0 ? 'booked' : 'free',
    });
  }
  return days;
}

describe('AvailabilityCalendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    mockUseAvailability.mockReturnValue({
      days: createMockDays(year, month),
      isLoading: false,
      error: undefined,
    });
  });

  it('renders loading skeleton when isLoading true', () => {
    mockUseAvailability.mockReturnValueOnce({
      days: [],
      isLoading: true,
      error: undefined,
    });

    render(<AvailabilityCalendar listingId="test-id" />);
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders month navigation', () => {
    const now = new Date();
    const expectedMonth = [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь',
    ][now.getMonth()];

    render(<AvailabilityCalendar listingId="test-id" />);
    expect(screen.getByText(new RegExp(expectedMonth))).toBeInTheDocument();
  });

  it('navigates to previous month', () => {
    const { container } = render(<AvailabilityCalendar listingId="test-id" />);
    const prevBtn = container.querySelector(
      'button[aria-label="Предыдущий месяц"]',
    ) as HTMLButtonElement;

    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const expectedMonth = [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь',
    ][prevMonth.getMonth()];

    fireEvent.click(prevBtn);
    expect(screen.getByText(new RegExp(expectedMonth))).toBeInTheDocument();
  });

  it('navigates to next month', () => {
    const { container } = render(<AvailabilityCalendar listingId="test-id" />);
    const nextBtn = container.querySelector(
      'button[aria-label="Следующий месяц"]',
    ) as HTMLButtonElement;

    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const expectedMonth = [
      'Январь',
      'Февраль',
      'Март',
      'Апрель',
      'Май',
      'Июнь',
      'Июль',
      'Август',
      'Сентябрь',
      'Октябрь',
      'Ноябрь',
      'Декабрь',
    ][nextMonth.getMonth()];

    fireEvent.click(nextBtn);
    expect(screen.getByText(new RegExp(expectedMonth))).toBeInTheDocument();
  });

  it('renders weekday headers', () => {
    render(<AvailabilityCalendar listingId="test-id" />);
    ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].forEach((day) => {
      expect(screen.getAllByText(day).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders legend with availability status', () => {
    render(<AvailabilityCalendar listingId="test-id" />);
    expect(screen.getAllByText('Свободно').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Занято').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Прошедшие').length).toBeGreaterThanOrEqual(1);
  });

  it('applies free date styling in view mode', () => {
    const { container } = render(
      <AvailabilityCalendar listingId="test-id" mode="view" />,
    );
    const freeDates = container.querySelectorAll('.bg-green-100');
    expect(freeDates.length).toBeGreaterThan(0);
  });

  it('applies booked date styling', () => {
    const { container } = render(<AvailabilityCalendar listingId="test-id" />);
    const bookedDates = container.querySelectorAll('.bg-red-100');
    expect(bookedDates.length).toBeGreaterThan(0);
  });

  it('applies past date styling', () => {
    const { container } = render(<AvailabilityCalendar listingId="test-id" />);
    const pastDates = container.querySelectorAll('.bg-gray-100');
    expect(pastDates.length).toBeGreaterThan(0);
  });

  it('renders selected check-in/check-out dates', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(today);
    const checkOut = new Date(today);
    checkOut.setDate(checkIn.getDate() + 3);

    render(
      <AvailabilityCalendar
        listingId="test-id"
        selectedCheckIn={checkIn}
        selectedCheckOut={checkOut}
      />,
    );

    const selectedDates = document.querySelectorAll('.bg-blue-600.text-white');
    expect(selectedDates.length).toBe(2);
  });

  it('renders range between selected dates', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(today);
    const checkOut = new Date(today);
    checkOut.setDate(checkIn.getDate() + 3);

    render(
      <AvailabilityCalendar
        listingId="test-id"
        selectedCheckIn={checkIn}
        selectedCheckOut={checkOut}
      />,
    );

    const rangeDates = document.querySelectorAll('.bg-blue-100.text-blue-800');
    expect(rangeDates.length).toBeGreaterThan(0);
  });

  it('does not call onDateSelect in view mode', () => {
    const onDateSelect = vi.fn();
    render(
      <AvailabilityCalendar
        listingId="test-id"
        mode="view"
        onDateSelect={onDateSelect}
      />,
    );

    const clickableDates = document.querySelectorAll('[role="button"]');
    clickableDates.forEach((el) => fireEvent.click(el));
    expect(onDateSelect).not.toHaveBeenCalled();
  });

  it('displays current year in header', () => {
    render(<AvailabilityCalendar listingId="test-id" />);
    const now = new Date();
    expect(
      screen.getAllByText(new RegExp(String(now.getFullYear()))).length,
    ).toBeGreaterThanOrEqual(1);
  });
});

describe('AvailabilityCalendar API', () => {
  it('useAvailability fetches availability endpoint', () => {
    vi.clearAllMocks();
    mockUseAvailability.mockReturnValue({
      days: [],
      isLoading: false,
      error: undefined,
    });

    render(<AvailabilityCalendar listingId="listing-abc" />);
    expect(mockUseAvailability).toHaveBeenCalledTimes(1);
    const calls = mockUseAvailability.mock.calls;
    expect(calls[0][0]).toBe('listing-abc');
    expect(calls[0][1]).toBeUndefined();
  });
});

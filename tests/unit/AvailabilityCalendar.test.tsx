/**
 * ANCHOR: listing
 * PURPOSE: Unit-тесты AvailabilityCalendar — рендеринг, навигация, выбор дат.
 *
 * Selection logic tests:
 * - First click → checkIn (pending), isNewSelection=true
 * - Second click with date > checkIn → checkOut (complete), isNewSelection=false
 * - Second click with date < checkIn → swap dates, isNewSelection=false
 * - Click on same date as checkIn → reset (clear all), isNewSelection=true
 * - When complete and user clicks → reset to new checkIn, isNewSelection=true
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AvailabilityCalendar } from '@/modules/listing/components/AvailabilityCalendar';

const mockUseAvailability = vi.fn();
vi.mock('@/modules/listing/hooks/useAvailability', () => ({
  useAvailability: (...args: unknown[]) => mockUseAvailability(...args),
}));

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
      status: past ? 'past' : d % 5 === 0 ? 'booked' : 'free',
    });
  }
  return days;
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

describe('AvailabilityCalendar', () => {
  beforeEach(() => {
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
    ][now.getUTCMonth()];

    render(<AvailabilityCalendar listingId="test-id" />);
    expect(screen.getByText(new RegExp(expectedMonth))).toBeInTheDocument();
  });

  it('navigates to previous month', () => {
    const { container } = render(<AvailabilityCalendar listingId="test-id" />);
    const prevBtn = container.querySelector(
      'button[aria-label="Предыдущий месяц"]',
    ) as HTMLButtonElement;

    const now = new Date();
    const prevMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
    );
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
    ][prevMonth.getUTCMonth()];

    fireEvent.click(prevBtn);
    expect(screen.getByText(new RegExp(expectedMonth))).toBeInTheDocument();
  });

  it('navigates to next month', () => {
    const { container } = render(<AvailabilityCalendar listingId="test-id" />);
    const nextBtn = container.querySelector(
      'button[aria-label="Следующий месяц"]',
    ) as HTMLButtonElement;

    const now = new Date();
    const nextMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );
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
    ][nextMonth.getUTCMonth()];

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

  it('renders selected check-in/check-out dates from props', () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const checkIn = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
    const checkOut = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);

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
    today.setUTCHours(0, 0, 0, 0);
    const checkIn = new Date(today);
    checkIn.setUTCDate(checkIn.getUTCDate() + 5);
    const checkOut = new Date(today);
    checkOut.setUTCDate(checkIn.getUTCDate() + 3);

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
      screen.getAllByText(new RegExp(String(now.getUTCFullYear()))).length,
    ).toBeGreaterThanOrEqual(1);
  });

  describe('date selection mode', () => {
    it('renders clickable dates in select mode', () => {
      const { container } = render(
        <AvailabilityCalendar listingId="test-id" mode="select" />,
      );
      const clickableDates = container.querySelectorAll('[role="button"]');
      expect(clickableDates.length).toBeGreaterThan(0);
    });

    it('first click sets checkIn with isNewSelection=true', () => {
      const onDateSelect = vi.fn();
      const { container } = render(
        <AvailabilityCalendar
          listingId="test-id"
          mode="select"
          onDateSelect={onDateSelect}
        />,
      );

      const clickableDates = getFutureClickableDates(container);
      expect(clickableDates.length).toBeGreaterThanOrEqual(1);

      fireEvent.click(clickableDates[0]);
      expect(onDateSelect).toHaveBeenCalledWith(expect.any(Date), null, true);
    });

    it('second click with later date sets checkOut with isNewSelection=false', () => {
      const onDateSelect = vi.fn();
      const { container } = render(
        <AvailabilityCalendar
          listingId="test-id"
          mode="select"
          onDateSelect={onDateSelect}
        />,
      );

      const clickableDates = getFutureClickableDates(container);
      expect(clickableDates.length).toBeGreaterThanOrEqual(2);

      fireEvent.click(clickableDates[0]);
      onDateSelect.mockClear();
      fireEvent.click(clickableDates[1]);

      expect(onDateSelect).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(Date),
        false,
      );
    });

    it('second click with earlier date swaps checkIn/checkOut', () => {
      const onDateSelect = vi.fn();
      const { container } = render(
        <AvailabilityCalendar
          listingId="test-id"
          mode="select"
          onDateSelect={onDateSelect}
        />,
      );

      const clickableDates = getFutureClickableDates(container);
      expect(clickableDates.length).toBeGreaterThanOrEqual(2);

      fireEvent.click(clickableDates[1]);
      onDateSelect.mockClear();
      fireEvent.click(clickableDates[0]);

      const [newCheckIn, newCheckOut] = onDateSelect.mock.calls[0];
      expect(newCheckIn.getTime()).toBeLessThan(newCheckOut.getTime());
      expect(onDateSelect.mock.calls[0][2]).toBe(false);
    });

    it('clicking same date as checkIn resets selection', () => {
      const onDateSelect = vi.fn();
      const { container } = render(
        <AvailabilityCalendar
          listingId="test-id"
          mode="select"
          onDateSelect={onDateSelect}
        />,
      );

      const clickableDates = getFutureClickableDates(container);
      expect(clickableDates.length).toBeGreaterThanOrEqual(1);

      fireEvent.click(clickableDates[0]);
      expect(onDateSelect).toHaveBeenCalledWith(expect.any(Date), null, true);

      onDateSelect.mockClear();
      fireEvent.click(clickableDates[0]);
      expect(onDateSelect).toHaveBeenCalledWith(expect.any(Date), null, true);
    });

    it('clicking new date when complete resets to new checkIn', () => {
      const onDateSelect = vi.fn();
      const { container } = render(
        <AvailabilityCalendar
          listingId="test-id"
          mode="select"
          onDateSelect={onDateSelect}
        />,
      );

      const clickableDates = getFutureClickableDates(container);
      expect(clickableDates.length).toBeGreaterThanOrEqual(3);

      fireEvent.click(clickableDates[0]);
      onDateSelect.mockClear();
      fireEvent.click(clickableDates[1]);

      const [, checkOut] = onDateSelect.mock.calls[0];
      expect(checkOut).not.toBeNull();

      onDateSelect.mockClear();
      fireEvent.click(clickableDates[2]);
      expect(onDateSelect).toHaveBeenCalledWith(expect.any(Date), null, true);
    });

    it('applies different styling for free dates in select vs view mode', () => {
      const viewContainer = render(
        <AvailabilityCalendar listingId="test-id" mode="view" />,
      ).container;

      const selectContainer = render(
        <AvailabilityCalendar listingId="test-id" mode="select" />,
      ).container;

      const viewClickable = viewContainer.querySelectorAll('[role="button"]');
      const selectClickable =
        selectContainer.querySelectorAll('[role="button"]');

      expect(selectClickable.length).toBeGreaterThanOrEqual(
        viewClickable.length,
      );
    });

    it('shows pending check-in state styling when only checkIn is set via props', () => {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const checkIn = new Date(today);
      checkIn.setUTCDate(today.getUTCDate() + 5);

      const { container } = render(
        <AvailabilityCalendar
          listingId="test-id"
          mode="select"
          selectedCheckIn={checkIn}
          onDateSelect={vi.fn()}
        />,
      );

      const pendingDates = container.querySelectorAll(
        '.bg-blue-600.text-white',
      );
      expect(pendingDates.length).toBe(1);
    });

    it('renders selected dates when both checkIn and checkOut are provided via props', () => {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      const checkIn = new Date(today);
      checkIn.setUTCDate(today.getUTCDate() + 1);
      const checkOut = new Date(today);
      checkOut.setUTCDate(today.getUTCDate() + 5);

      render(
        <AvailabilityCalendar
          listingId="test-id"
          mode="select"
          selectedCheckIn={checkIn}
          selectedCheckOut={checkOut}
        />,
      );

      expect(
        document.querySelector('.bg-blue-600.text-white'),
      ).toBeInTheDocument();
    });
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

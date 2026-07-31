/**
 * ANCHOR: listing
 * PURPOSE: Unit-тесты ListingDateSelector — валидация URL-дат, доступность.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ListingDateSelector } from '@/modules/listing/components/ListingDateSelector';

const mockReplace = vi.fn();
const mockPush = vi.fn();
const mockUseAvailability = vi.fn();

vi.mock('@/modules/listing/hooks/useAvailability', () => ({
  useAvailability: (...args: unknown[]) => mockUseAvailability(...args),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

function createMockDays(
  bookedDates: string[] = [],
  pastDates: string[] = [],
): Array<{ date: string; status: 'free' | 'booked' | 'past' }> {
  const days: Array<{ date: string; status: 'free' | 'booked' | 'past' }> = [];
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  for (let d = 1; d <= 31; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    let status: 'free' | 'booked' | 'past' = 'free';
    if (pastDates.includes(dateStr)) status = 'past';
    else if (bookedDates.includes(dateStr)) status = 'booked';
    days.push({ date: dateStr, status });
  }
  return days;
}

describe('ListingDateSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAvailability.mockReturnValue({
      days: createMockDays(),
      isLoading: false,
      error: undefined,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders calendar container', () => {
    const { container } = render(<ListingDateSelector listingId="test-id" />);
    expect(container.querySelector('.bg-white.rounded-xl.border')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<ListingDateSelector listingId="test-id" />);
    const prevButtons = screen.getAllByRole('button', { name: 'Предыдущий месяц' });
    const nextButtons = screen.getAllByRole('button', { name: 'Следующий месяц' });
    expect(prevButtons.length).toBeGreaterThan(0);
    expect(nextButtons.length).toBeGreaterThan(0);
  });

  it('renders week day headers', () => {
    render(<ListingDateSelector listingId="test-id" />);
    const всElements = screen.getAllByText('Вс');
    const пнElements = screen.getAllByText('Пн');
    expect(всElements.length).toBeGreaterThan(0);
    expect(пнElements.length).toBeGreaterThan(0);
  });

  it('renders availability calendar grid', () => {
    const { container } = render(<ListingDateSelector listingId="test-id" />);
    const grid = container.querySelector('.grid.grid-cols-7');
    expect(grid).toBeInTheDocument();
  });

  it('renders with default useAvailability response', () => {
    render(<ListingDateSelector listingId="test-id" />);
    expect(mockUseAvailability).toHaveBeenCalledWith('test-id');
  });

  it('does not show pending check-in message when no dates selected', () => {
    render(<ListingDateSelector listingId="test-id" />);
    expect(screen.queryByText('Выберите дату выезда')).not.toBeInTheDocument();
  });

  it('does not render book button when no dates selected', () => {
    render(<ListingDateSelector listingId="test-id" />);
    expect(screen.queryByText('Забронировать')).not.toBeInTheDocument();
  });

  it('passes listingId to useAvailability hook', () => {
    render(<ListingDateSelector listingId="my-listing-123" />);
    expect(mockUseAvailability).toHaveBeenCalledWith('my-listing-123');
  });

  it('does not call router.replace on initial render', () => {
    render(<ListingDateSelector listingId="test-id" />);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('does not call router.push on initial render', () => {
    render(<ListingDateSelector listingId="test-id" />);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('handles empty days array', () => {
    mockUseAvailability.mockReturnValue({
      days: [],
      isLoading: false,
      error: undefined,
    });

    const { container } = render(<ListingDateSelector listingId="test-id" />);
    expect(container.querySelector('.bg-white.rounded-xl.border')).toBeInTheDocument();
  });

  it('handles all booked dates', () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const bookedDates = [];
    for (let d = 1; d <= 31; d++) {
      bookedDates.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }

    mockUseAvailability.mockReturnValue({
      days: createMockDays(bookedDates),
      isLoading: false,
      error: undefined,
    });

    const { container } = render(<ListingDateSelector listingId="test-id" />);
    expect(container.querySelector('.bg-white.rounded-xl.border')).toBeInTheDocument();
  });

  it('renders without crashing with different listingIds', () => {
    ['listing-1', 'abc-123', 'test-id'].forEach((id) => {
      mockUseAvailability.mockClear();
      const { container } = render(<ListingDateSelector listingId={id} />);
      expect(container.querySelector('.bg-white.rounded-xl.border')).toBeInTheDocument();
    });
  });

  it('renders month and year in header', () => {
    const now = new Date();
    const monthNames = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    const currentMonth = monthNames[now.getMonth()];
    const currentYear = now.getFullYear().toString();

    render(<ListingDateSelector listingId="test-id" />);

    const monthElements = screen.getAllByText(new RegExp(currentMonth));
    const yearElements = screen.getAllByText(new RegExp(currentYear));
    expect(monthElements.length).toBeGreaterThan(0);
    expect(yearElements.length).toBeGreaterThan(0);
  });

  it('receives isLoading state', () => {
    mockUseAvailability.mockReturnValue({
      days: [],
      isLoading: true,
      error: undefined,
    });

    render(<ListingDateSelector listingId="test-id" />);
    expect(mockUseAvailability).toHaveBeenCalled();
  });
});
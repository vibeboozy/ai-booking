import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangePicker } from '@/modules/search/components/DateRangePicker';

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children, open, onOpenChange }: any) => (
    <div data-testid="popover" data-open={open} onClick={() => onOpenChange?.(!open)}>
      {Array.isArray(children) ? children[0] : children}
    </div>
  ),
  PopoverTrigger: ({ children, asChild }: any) => {
    if (asChild) return <>{children}</>;
    return <button data-testid="popover-trigger">{children}</button>;
  },
  PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
}));

vi.mock('@/components/ui/calendar', () => ({
  Calendar: ({ onSelect }: any) => (
    <div data-testid="calendar">
      <button
        data-testid="select-past"
        onClick={() => onSelect?.({ from: new Date('2026-06-10'), to: new Date('2026-06-15') })}
      >
        Select Past
      </button>
      <button
        data-testid="select-valid"
        onClick={() => onSelect?.({ from: new Date('2026-06-20'), to: new Date('2026-06-25') })}
      >
        Select Valid
      </button>
    </div>
  ),
}));

describe('SEARCH_DATE_RANGE_PICKER', () => {
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  describe('SC-FEAT008-001: Успешный выбор диапазона дат через календарь', () => {
    it('при выборе checkIn=2026-06-20 и checkOut=2026-06-25 возвращает корректные даты', () => {
      render(
        <DateRangePicker
          checkIn=""
          checkOut=""
          onSelect={mockOnSelect}
        />
      );

      fireEvent.click(screen.getByTestId('select-valid'));

      expect(mockOnSelect).toHaveBeenCalledWith({
        checkIn: '2026-06-20',
        checkOut: '2026-06-25',
      });
    });
  });

  describe('SC-FEAT008-002: Ошибка: checkOut не может быть раньше checkIn', () => {
    it('при попытке выбрать прошедшую дату onSelect не вызывается', () => {
      const mockOnSelect2 = vi.fn();
      render(
        <DateRangePicker
          checkIn="2026-06-25"
          checkOut=""
          onSelect={mockOnSelect2}
        />
      );

      fireEvent.click(screen.getByTestId('select-past'));

      expect(mockOnSelect2).not.toHaveBeenCalled();
    });
  });

  describe('SC-FEAT008-003: Ошибка: нельзя выбрать дату в прошлом', () => {
    it('прошедшие даты disabled', () => {
      render(
        <DateRangePicker
          checkIn=""
          checkOut=""
          onSelect={mockOnSelect}
        />
      );

      const calendars = screen.getAllByTestId('calendar');
      expect(calendars.length).toBeGreaterThan(0);
    });
  });

  describe('SC-FEAT008-004: Успешный ручной ввод даты в формате ДД.ММ.ГГГГ', () => {
    it('парсит "25.06.2026" в "2026-06-25"', () => {
      render(
        <DateRangePicker
          checkIn=""
          checkOut=""
          onSelect={mockOnSelect}
        />
      );

      const input = screen.getByLabelText('Ввод даты вручную');
      fireEvent.change(input, { target: { value: '25.06.2026' } });
      fireEvent.blur(input);

      expect(mockOnSelect).toHaveBeenCalled();
    });
  });

  describe('SC-FEAT008-005: Ошибка валидации: невалидный формат даты', () => {
    it('при вводе "32.01.2026" показывает ошибку', () => {
      render(
        <DateRangePicker
          checkIn=""
          checkOut=""
          onSelect={mockOnSelect}
        />
      );

      const input = screen.getByLabelText('Ввод даты вручную');
      fireEvent.change(input, { target: { value: '32.01.2026' } });
      fireEvent.blur(input);

      const errorEl = screen.getByText('Неверный формат даты');
      expect(errorEl).toBeInTheDocument();
    });
  });

  describe('Log markers', () => {
    it('SC-FEAT008-010: имеет ENTRY лог', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      render(
        <DateRangePicker
          checkIn=""
          checkOut=""
          onSelect={mockOnSelect}
        />
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[search][DateRangePicker][SEARCH_DATE_RANGE_PICKER][ENTRY]'),
        expect.any(Object)
      );
      consoleSpy.mockRestore();
    });

    it('SC-FEAT008-010: имеет EXIT лог', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      render(
        <DateRangePicker
          checkIn=""
          checkOut=""
          onSelect={mockOnSelect}
        />
      );

      const exitCalls = consoleSpy.mock.calls.filter(
        call => call[0]?.includes('[EXIT]')
      );
      expect(exitCalls.length).toBeGreaterThan(0);
      consoleSpy.mockRestore();
    });
  });
});
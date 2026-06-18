import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { StarRating } from '@/modules/profile/components/StarRating';

// Mock cn utility
vi.mock('@/shared/utils/cn', () => ({
  cn: (...args: (string | undefined)[]) => args.filter(Boolean).join(' '),
}));

describe('StarRating', () => {
  describe('рендеринг', () => {
    it('рендерит 5 звёзд', () => {
      const { container } = render(<StarRating value={0} />);
      const buttons = within(container).getAllByRole('button');
      expect(buttons).toHaveLength(5);
    });

    it('рендерит с значением 0 (без выбора)', () => {
      const { container } = render(<StarRating value={0} />);
      // Все звёзды должны быть серыми (не заполненные)
      const stars = container.querySelectorAll('svg');
      expect(stars).toHaveLength(5);
    });

    it('рендерит с значением 3', () => {
      const { container } = render(<StarRating value={3} />);
      const buttons = within(container).getAllByRole('button');
      // 3 первые звезды заполненные (желтые), 2 последние серые
      expect(buttons).toHaveLength(5);
    });
  });

  describe('интерактивный режим', () => {
    it('вызывает onChange при клике на звезду', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <StarRating value={0} onChange={handleChange} />,
      );

      const buttons = within(container).getAllByRole('button');
      fireEvent.click(buttons[2]); // Кликаем на 3-ю звезду (индекс 2)

      expect(handleChange).toHaveBeenCalledWith(3);
    });

    it('вызывает onChange для каждой звезды', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <StarRating value={0} onChange={handleChange} />,
      );

      const buttons = within(container).getAllByRole('button');

      fireEvent.click(buttons[0]);
      expect(handleChange).toHaveBeenCalledWith(1);

      fireEvent.click(buttons[4]);
      expect(handleChange).toHaveBeenCalledWith(5);
    });

    it('не вызывает onChange в readonly режиме', () => {
      const handleChange = vi.fn();
      const { container } = render(
        <StarRating value={3} onChange={handleChange} readonly />,
      );

      const buttons = within(container).getAllByRole('button');
      fireEvent.click(buttons[2]);

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('кнопки disabled в readonly режиме', () => {
      const { container } = render(<StarRating value={3} readonly />);

      const buttons = within(container).getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('размеры', () => {
    it('рендерит размер sm', () => {
      const { container } = render(<StarRating value={0} size="sm" />);
      const svg = container.querySelector('svg');
      expect(svg?.className.baseVal).toContain('w-4 h-4');
    });

    it('рендерит размер md (по умолчанию)', () => {
      const { container } = render(<StarRating value={0} />);
      const svg = container.querySelector('svg');
      expect(svg?.className.baseVal).toContain('w-5 h-5');
    });

    it('рендерит размер lg', () => {
      const { container } = render(<StarRating value={0} size="lg" />);
      const svg = container.querySelector('svg');
      expect(svg?.className.baseVal).toContain('w-7 h-7');
    });
  });

  describe('aria-label', () => {
    it('имеет radiogroup role когда не readonly', () => {
      const { container } = render(<StarRating value={0} onChange={vi.fn()} />);
      const radiogroup = within(container).getByRole('radiogroup');
      expect(radiogroup).toBeInTheDocument();
    });

    it('имеет img role когда readonly', () => {
      const { container } = render(<StarRating value={3} readonly />);
      const img = within(container).getByRole('img');
      expect(img).toBeInTheDocument();
    });
  });
});

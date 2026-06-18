import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import { ReviewForm } from '@/modules/profile/components/ReviewForm';

// Mock submitReviewAction
const mockSubmitReviewAction = vi.fn();
vi.mock('@/modules/profile/actions/submitReview', () => ({
  submitReviewAction: (...args: unknown[]) => mockSubmitReviewAction(...args),
}));

// Mock cn utility
vi.mock('@/shared/utils/cn', () => ({
  cn: (...args: (string | undefined)[]) => args.filter(Boolean).join(' '),
}));

describe('ReviewForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('рендеринг формы', () => {
    it('рендерит заголовок с названием объекта', () => {
      const { container } = render(
        <ReviewForm bookingId="booking-123" listingTitle="Уютная квартира" />,
      );
      expect(
        within(container).getByText('Уютная квартира'),
      ).toBeInTheDocument();
    });

    it('рендерит поле textarea для отзыва', () => {
      const { container } = render(
        <ReviewForm bookingId="booking-123" listingTitle="Уютная квартира" />,
      );
      const textarea = within(container).getByRole('textbox');
      expect(textarea).toBeInTheDocument();
    });

    it('рендерит StarRating компонент', () => {
      const { container } = render(
        <ReviewForm bookingId="booking-123" listingTitle="Уютная квартира" />,
      );
      const radiogroup = within(container).getByRole('radiogroup');
      expect(radiogroup).toBeInTheDocument();
    });

    it('кнопка отправки disabled когда рейтинг 0', () => {
      const { container } = render(
        <ReviewForm bookingId="booking-123" listingTitle="Уютная квартира" />,
      );
      const submitButton = within(container).getByRole('button', {
        name: /отправить/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it('кнопка отправки disabled когда текст менее 10 символов', () => {
      const { container } = render(
        <ReviewForm bookingId="booking-123" listingTitle="Уютная квартира" />,
      );

      // Устанавливаем рейтинг
      const radiogroup = within(container).getByRole('radiogroup');
      const buttons = radiogroup.querySelectorAll('button');
      fireEvent.click(buttons[2]); // 3 звезды

      // Вводим короткий текст
      const textarea = within(container).getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Короткий' } });

      const submitButton = within(container).getByRole('button', {
        name: /отправить отзыв/i,
      });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('валидация', () => {
    it('кнопка disabled когда рейтинг 0', () => {
      const { container } = render(
        <ReviewForm bookingId="booking-123" listingTitle="Уютная квартира" />,
      );

      const textarea = within(container).getByRole('textbox');
      fireEvent.change(textarea, {
        target: { value: 'Длинный отзыв о квартире' },
      });

      const submitButton = within(container).getByRole('button', {
        name: /отправить/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it('кнопка disabled и не показывает ошибку когда текст менее 10 символов', () => {
      const { container } = render(
        <ReviewForm bookingId="booking-123" listingTitle="Уютная квартира" />,
      );

      // Устанавливаем рейтинг
      const radiogroup = within(container).getByRole('radiogroup');
      fireEvent.click(radiogroup.querySelectorAll('button')[2]);

      const textarea = within(container).getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Короткий' } });

      const submitButton = within(container).getByRole('button', {
        name: /отправить отзыв/i,
      });
      expect(submitButton).toBeDisabled();

      // Ошибка не должна показываться пока пользователь не попытается отправить
      expect(
        screen.queryByText('Отзыв должен содержать минимум 10 символов'),
      ).not.toBeInTheDocument();
    });
  });

  describe('успешная отправка', () => {
    it('вызывает submitReviewAction с правильными параметрами', async () => {
      mockSubmitReviewAction.mockResolvedValueOnce({ success: true });

      const { container } = render(
        <ReviewForm bookingId="booking-123" listingTitle="Уютная квартира" />,
      );

      // Устанавливаем рейтинг
      const radiogroup = within(container).getByRole('radiogroup');
      const buttons = radiogroup.querySelectorAll('button');
      fireEvent.click(buttons[4]); // 5 звёзд

      // Вводим текст
      const textarea = within(container).getByRole('textbox');
      fireEvent.change(textarea, {
        target: { value: 'Отличная квартира, всё понравилось!' },
      });

      const submitButton = within(container).getByRole('button', {
        name: /отправить/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSubmitReviewAction).toHaveBeenCalledWith({
          bookingId: 'booking-123',
          rating: 5,
          text: 'Отличная квартира, всё понравилось!',
        });
      });
    });

    it('показывает сообщение об успехе после отправки', async () => {
      mockSubmitReviewAction.mockResolvedValueOnce({ success: true });

      const { container } = render(
        <ReviewForm bookingId="booking-123" listingTitle="Уютная квартира" />,
      );

      const radiogroup = within(container).getByRole('radiogroup');
      fireEvent.click(radiogroup.querySelectorAll('button')[4]);

      const textarea = within(container).getByRole('textbox');
      fireEvent.change(textarea, {
        target: { value: 'Отличная квартира, всё понравилось!' },
      });

      fireEvent.click(
        within(container).getByRole('button', { name: /отправить/i }),
      );

      await waitFor(() => {
        expect(screen.getByText('Спасибо за отзыв!')).toBeInTheDocument();
      });
    });
  });

  describe('ошибка при отправке', () => {
    it('показывает ошибку от сервера', async () => {
      mockSubmitReviewAction.mockResolvedValueOnce({
        success: false,
        error: 'Отзыв уже существует',
      });

      const { container } = render(
        <ReviewForm bookingId="booking-123" listingTitle="Уютная квартира" />,
      );

      const radiogroup = within(container).getByRole('radiogroup');
      fireEvent.click(radiogroup.querySelectorAll('button')[4]);

      const textarea = within(container).getByRole('textbox');
      fireEvent.change(textarea, {
        target: { value: 'Отличная квартира, всё понравилось!' },
      });

      fireEvent.click(
        within(container).getByRole('button', { name: /отправить/i }),
      );

      await waitFor(() => {
        expect(screen.getByText('Отзыв уже существует')).toBeInTheDocument();
      });
    });
  });

  describe('счетчик символов', () => {
    it('показывает количество введенных символов', () => {
      const { container } = render(
        <ReviewForm bookingId="booking-123" listingTitle="Уютная квартира" />,
      );

      const textarea = within(container).getByRole('textbox');
      fireEvent.change(textarea, { target: { value: 'Привет' } });

      expect(
        within(container).getByText('6 / 10 минимально'),
      ).toBeInTheDocument();
    });

    it('меняет текст счетчика при вводе', () => {
      const { container } = render(
        <ReviewForm bookingId="booking-123" listingTitle="Уютная квартира" />,
      );

      const textarea = within(container).getByRole('textbox');
      fireEvent.change(textarea, {
        target: { value: 'Длинный отзыв о квартире' },
      });

      expect(
        within(container).getByText('24 / 10 минимально'),
      ).toBeInTheDocument();
    });
  });
});

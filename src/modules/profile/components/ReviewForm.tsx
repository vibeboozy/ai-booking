/**
 * ANCHOR: profile
 * PURPOSE: Форма отзыва: star rating + text.
 * Dependencies: StarRating, submitReviewAction.
 * CRITICAL: Only accessible for completed booking without existing review.
 */

'use client';

import { useState, useTransition } from 'react';
import { StarRating } from '@/modules/profile/components/StarRating';
import { submitReviewAction } from '@/modules/profile/actions/submitReview';
import { cn } from '@/shared/utils/cn';

type ReviewFormProps = {
  bookingId: string;
  listingTitle: string;
};

const ratingLabels = ['', 'Ужасно', 'Плохо', 'Нормально', 'Хорошо', 'Отлично'];

export function ReviewForm({ bookingId, listingTitle }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [isSubmitting, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check text length first (as per test expectations)
    if (!text.trim() || text.trim().length < 10) {
      setError('Отзыв должен содержать минимум 10 символов');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Пожалуйста, поставьте оценку');
      return;
    }

    startTransition(async () => {
      const result = await submitReviewAction({ bookingId, rating, text: text.trim() });
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || 'Ошибка при отправке отзыва');
      }
    });
  };

  if (submitted) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <div className="mb-2 text-4xl">✅</div>
        <h3 className="text-lg font-semibold text-green-800">
          Спасибо за отзыв!
        </h3>
        <p className="mt-1 text-sm text-green-600">
          Ваш отзыв о «{listingTitle}» поможет другим путешественникам.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Listing info */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-500">Отзыв о:</p>
        <p className="font-semibold">{listingTitle}</p>
      </div>

      {/* Rating */}
      <div>
        <label className="mb-2 block text-sm font-medium">Оценка</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {rating > 0 && (
          <p className="mt-2 text-sm text-gray-500">{ratingLabels[rating]}</p>
        )}
      </div>

      {/* Text */}
      <div>
        <label htmlFor="review-text" className="mb-2 block text-sm font-medium">
          Ваш отзыв
        </label>
        <textarea
          id="review-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Поделитесь впечатлениями о жилье..."
          rows={5}
          className={cn(
            'w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
          )}
        />
        <p className="mt-1 text-sm text-gray-500">
          {text.length} / 10 минимально
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <a
          href="/profile/trips"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Назад
        </a>
        <button
          type="submit"
          disabled={isSubmitting || rating === 0 || text.trim().length < 10}
          className={cn(
            'rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors',
            'hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
        </button>
      </div>
    </form>
  );
}
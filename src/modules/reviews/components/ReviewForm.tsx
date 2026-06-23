/**
 * ANCHOR: reviews
 * PURPOSE: Форма отзыва: stars + text + optional photo upload.
 * Dependencies: StarRating, submitReview action.
 * CRITICAL: Only accessible for completed booking without existing review.
 *
 * DO:
 * - aria-label on StarRating
 * DONT:
 * - Allow submit without rating 1-5
 */

'use client';

import { useState, useTransition, useCallback } from 'react';
import { StarRating } from '@/modules/reviews/components/StarRating';
import { cn } from '@/shared/utils/cn';

type ReviewFormProps = {
  bookingId: string;
  listingTitle: string;
  onSubmit?: (data: {
    rating: number;
    text: string;
    photos: string[];
  }) => Promise<{ success: boolean; error?: string }>;
};

const ratingLabels = ['', 'Ужасно', 'Плохо', 'Нормально', 'Хорошо', 'Отлично'];

export function ReviewForm({
  bookingId,
  listingTitle,
  onSubmit,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      // Limit to 5 photos
      if (photos.length >= 5) {
        setError('Максимум 5 фотографий');
        return;
      }

      // For now, create local URLs for preview
      // In production, this would upload to a storage service
      const newPhotos: string[] = [];
      for (let i = 0; i < Math.min(files.length, 5 - photos.length); i++) {
        newPhotos.push(URL.createObjectURL(files[i]));
      }
      setPhotos((prev) => [...prev, ...newPhotos]);
    },
    [photos.length],
  );

  const removePhoto = useCallback((index: number) => {
    setPhotos((prev) => {
      const newPhotos = [...prev];
      URL.revokeObjectURL(newPhotos[index]);
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check text length
    if (!text.trim() || text.trim().length < 10) {
      setError('Отзыв должен содержать минимум 10 символов');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Пожалуйста, поставьте оценку');
      return;
    }

    startTransition(async () => {
      if (onSubmit) {
        const result = await onSubmit({ rating, text: text.trim(), photos });
        if (result.success) {
          setSubmitted(true);
        } else {
          setError(result.error || 'Ошибка при отправке отзыва');
        }
      } else {
        // Default behavior: call API
        try {
          const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bookingId,
              rating,
              text: text.trim(),
              photos,
            }),
          });

          if (response.ok) {
            setSubmitted(true);
          } else {
            const data = await response.json();
            setError(data.error || 'Ошибка при отправке отзыва');
          }
        } catch {
          setError('Ошибка сети. Попробуйте ещё раз.');
        }
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

      {/* Photos */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Фотографии (необязательно)
        </label>
        <div className="flex flex-wrap gap-3">
          {photos.map((photo, index) => (
            <div key={photo} className="relative">
              <img
                src={photo}
                alt={`Фото ${index + 1}`}
                className="h-20 w-20 rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                aria-label={`Удалить фото ${index + 1}`}
              >
                ×
              </button>
            </div>
          ))}
          {photos.length < 5 && (
            <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500">
              <span className="text-2xl">+</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Загрузите до 5 фотографий ({photos.length}/5)
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

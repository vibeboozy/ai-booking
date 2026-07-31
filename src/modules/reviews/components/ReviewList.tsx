/**
 * ANCHOR: reviews
 * PURPOSE: Paginated list отзывов на странице listing.
 * Dependencies: GET /api/listings/[id]/reviews.
 * CRITICAL: Author name masked (first name + last initial).
 *
 * DO:
 * - Paginate default 5 per page on listing
 * DONT:
 * - Expose full email in author field
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { StarRating } from '@/modules/reviews/components/StarRating';
import { removeReview } from '@/modules/reviews/actions/deleteReview';
import { cn } from '@/shared/utils/cn';
import type { ReviewPublic } from '@/modules/reviews/types';
import { API } from '@/shared/constants/urls';

type ReviewListProps = {
  listingId: string;
  initialLimit?: number;
  currentUserId?: string | null;
  className?: string;
};

type ReviewsResponse = {
  data: ReviewPublic[];
  meta: { total: number; page: number };
};

const REVIEWS_PER_PAGE = 5;

function maskAuthorName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0];
  }
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return `${firstName} ${lastName.charAt(0)}.`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function ReviewCard({
  review,
  currentUserId,
  onDelete,
}: {
  review: ReviewPublic;
  currentUserId?: string | null;
  onDelete?: (reviewId: string) => void;
}) {
  const maskedName = maskAuthorName(review.author.name);
  const isOwner = currentUserId && currentUserId === review.author.id;

  return (
    <article className="border-b border-gray-100 py-6 last:border-0">
      {/* Header: avatar, name, rating, date */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar placeholder */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-pink-500 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
          {review.author.name.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-medium text-gray-900 truncate">
              {maskedName}
            </span>
            <div className="flex items-center gap-2">
              <StarRating value={review.rating} readonly size="sm" />
              <span className="text-sm text-gray-500">
                {formatDate(review.createdAt)}
              </span>
              {isOwner && onDelete && (
                <button
                  onClick={() => onDelete(review.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                  aria-label="Удалить отзыв"
                  title="Удалить отзыв"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review text */}
      <p className="text-gray-700 leading-relaxed">{review.text}</p>

      {/* Photos if any */}
      {review.photos && review.photos.length > 0 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {review.photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`Фото ${index + 1} отзыва`}
              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              loading="lazy"
            />
          ))}
        </div>
      )}
    </article>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className={cn(
          'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
          currentPage <= 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100',
        )}
        aria-label="Предыдущая страница"
      >
        ←
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-red-500 text-white'
                : 'text-gray-600 hover:bg-gray-100',
            )}
            aria-label={`Страница ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className={cn(
          'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
          currentPage >= totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-gray-600 hover:bg-gray-100',
        )}
        aria-label="Следующая страница"
      >
        →
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
          <div className="space-y-2 ml-13">
            <div className="h-3 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReviewList({
  listingId,
  initialLimit = REVIEWS_PER_PAGE,
  currentUserId,
  className,
}: ReviewListProps) {
  const [reviews, setReviews] = useState<ReviewPublic[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(
    async (page: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API.LISTINGS_REVIEWS(listingId)}?page=${page}&limit=${initialLimit}`,
        );

        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }

        const data: ReviewsResponse = await response.json();
        setReviews(data.data);
        setTotal(data.meta.total);
        setTotalPages(Math.ceil(data.meta.total / initialLimit));
        setCurrentPage(data.meta.page);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Ошибка загрузки отзывов',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [listingId, initialLimit],
  );

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  const handleDeleteReview = useCallback(
    async (reviewId: string) => {
      if (!confirm('Удалить этот отзыв?')) {
        return;
      }

      const result = await removeReview(reviewId);
      if (result.error) {
        alert(result.error);
        return;
      }

      // Refresh reviews list
      fetchReviews(currentPage);
    },
    [currentPage, fetchReviews],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      fetchReviews(page);
      // Scroll to reviews section
      document
        .getElementById(`reviews-${listingId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [fetchReviews, listingId],
  );

  if (isLoading) {
    return (
      <div className={cn('py-4', className)}>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('py-4 text-center', className)}>
        <p className="text-red-500 text-sm">{error}</p>
        <button
          onClick={() => fetchReviews(currentPage)}
          className="mt-2 text-sm text-red-500 hover:underline"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <p className="text-gray-500">Пока нет отзывов. Будьте первым!</p>
      </div>
    );
  }

  return (
    <div id={`reviews-${listingId}`} className={cn('py-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <svg
          className="w-5 h-5 text-red-500"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
            clipRule="evenodd"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">
          Отзывы {total > 0 && `(${total})`}
        </h3>
      </div>

      {/* Reviews list */}
      <div className="divide-y divide-gray-100">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            currentUserId={currentUserId}
            onDelete={currentUserId ? handleDeleteReview : undefined}
          />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

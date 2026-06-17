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

type ReviewFormProps = {
  bookingId: string;
};

export function ReviewForm(_props: ReviewFormProps) {
  return null;
}

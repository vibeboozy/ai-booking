/**
 * ANCHOR: reviews
 * PURPOSE: Public API модуля reviews (Dev E). Отзывы, рейтинги, агрегация.
 * Dependencies: @/modules/booking (completed Booking).
 *
 * DO:
 * - Экспортировать StarRating, ReviewList, RatingBadge для listing/search
 * DONT:
 * - Allow review without completed booking
 */

export { ReviewForm } from '@/modules/reviews/components/ReviewForm';
export { StarRating } from '@/modules/reviews/components/StarRating';
export { ReviewList } from '@/modules/reviews/components/ReviewList';
export { RatingBadge } from '@/modules/reviews/components/RatingBadge';
export { calculateAverageRating } from '@/modules/reviews/utils/calculateAverageRating';
export type { ReviewInput, ReviewPublic } from '@/modules/reviews/types';

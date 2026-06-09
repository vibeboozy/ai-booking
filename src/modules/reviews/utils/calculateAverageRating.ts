/**
 * ANCHOR: reviews
 * PURPOSE: Агрегация среднего рейтинга (1 decimal).
 * Dependencies: none.
 * CRITICAL: Used on review create/delete to update Listing.averageRating.
 *
 * DO:
 * - Return 0 for empty array
 * DONT:
 * - AVG() on every search query
 */

export function calculateAverageRating(_ratings: number[]): number {
  return 0;
}

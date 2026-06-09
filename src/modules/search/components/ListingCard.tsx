/**
 * ANCHOR: search
 * PURPOSE: Карточка жилья в результатах поиска (ListingPreview).
 * Dependencies: @/shared/types/listing, @/modules/profile (FavoriteButton), @/modules/reviews (RatingBadge).
 * CRITICAL: Ссылка на /listings/[id] с preserved search params.
 *
 * DO:
 * - next/image для первого фото
 * - data-testid="listing-card"
 * DONT:
 * - Загружать description на карточку
 */

import type { ListingPreview } from '@/shared/types/listing';

type ListingCardProps = {
  listing: ListingPreview;
};

export function ListingCard(_props: ListingCardProps) {
  return null;
}

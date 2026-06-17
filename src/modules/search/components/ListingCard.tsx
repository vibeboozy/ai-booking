'use client';

/**
 * ANCHOR: LISTING_CARD
 * PURPOSE: Карточка жилья в результатах поиска (ListingPreview).
 *
 * @PreConditions:
 * - listing: ListingPreview passed as prop
 * - Image from listing.images[0]
 * - formatPrice imported from '@/shared/utils/formatPrice'
 * - Link to /listings/[id] with preserved search params
 * - useSearchParams from 'next/navigation' available
 *
 * @PostConditions:
 * - при успехе: Renders image, title, city, price, rating badge
 * - при успехе: data-testid="listing-card" attribute present
 * - при успехе: Links to /listings/[id]?{current search params}
 * - при пустом images[]: Renders placeholder, no crash
 *
 * @SideEffects: нет
 *
 * Dependencies: @/shared/types/listing, @/modules/profile (FavoriteButton), @/modules/reviews (RatingBadge).
 * CRITICAL: Ссылка на /listings/[id] с preserved search params.
 *
 * DO:
 * - next/image для первого фото
 * - data-testid="listing-card"
 * DONT:
 * - Загружать description на карточку
 */

import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import type { ListingPreview } from '@/shared/types/listing';
import { formatPrice } from '@/shared/utils/formatPrice';

type ListingCardProps = {
  listing: ListingPreview;
};

// [START LISTING_CARD]
export function ListingCard({ listing }: ListingCardProps) {
  console.log('[search][ListingCard][LISTING_CARD][ENTRY]', {
    listing_id: listing.id,
    title: listing.title,
    images_count: listing.images.length,
  });

  const searchParams = useSearchParams();
  const searchQuery = searchParams.toString();
  const listingUrl = `/listings/${listing.id}${searchQuery ? `?${searchQuery}` : ''}`;

  const hasImages = listing.images && listing.images.length > 0;
  const imageSrc = hasImages ? listing.images[0] : null;
  const cityCountry = `${listing.city}, ${listing.country}`;

  console.log('[search][ListingCard][LISTING_CARD][DECISION][images-empty]', {
    listing_id: listing.id,
    has_images: hasImages,
    image_src: imageSrc,
    url: listingUrl,
  });

  console.log('[search][ListingCard][LISTING_CARD][EXIT]', {
    result: 'success',
    listing_id: listing.id,
  });

  return (
    <Link
      href={listingUrl}
      data-testid="listing-card"
      className="group block overflow-hidden rounded-t-xl bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: '16/9' }}>
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={listing.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
            <span className="text-4xl">🏠</span>
          </div>
        )}
        <div className="absolute top-3 right-3 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-foreground shadow-sm">
          {listing.propertyType === 'apartment' && 'Квартира'}
          {listing.propertyType === 'house' && 'Дом'}
          {listing.propertyType === 'room' && 'Комната'}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-1 flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-foreground">{listing.title}</h3>
          {listing.averageRating > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <span className="text-amber-500">★</span>
              <span className="font-medium">{listing.averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">({listing.reviewCount})</span>
            </div>
          )}
        </div>

        <p className="mb-3 text-sm text-muted-foreground">{cityCountry}</p>

        <p className="text-lg font-bold text-foreground">
          {formatPrice(listing.pricePerNight)}
          <span className="text-sm font-normal text-muted-foreground"> / ночь</span>
        </p>
      </div>
    </Link>
  );
}
// [END LISTING_CARD]

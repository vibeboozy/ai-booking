/**
 * ANCHOR: profile
 * PURPOSE: Grid сохранённых мест (ListingPreview cards).
 * Dependencies: useFavorites, ListingCard from search module.
 *
 * DO:
 * - Empty state «Пока ничего не сохранено»
 * - Grid layout with responsive columns
 * DONT:
 * - Fetch favorites without auth
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/shared/utils/cn';
import { formatPrice } from '@/shared/utils/formatPrice';
import { FavoriteButton } from './FavoriteButton';
import type { ListingPreview } from '@/shared/types/listing';
import { API, URL } from '@/shared/constants/urls';

function FavoriteCard({
  listing,
  onRemove,
}: {
  listing: ListingPreview;
  onRemove: (id: string) => void;
}) {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(listing.id);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg',
        isRemoving && 'opacity-50',
      )}
    >
      {/* Image */}
      <Link href={URL.LISTING(listing.id)} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={listing.images[0] || '/placeholder.jpg'}
            alt={listing.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />

          {/* Favorite button overlay */}
          <div className="absolute right-2 top-2">
            <FavoriteButton listingId={listing.id} initialFavorited size="sm" />
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={URL.LISTING(listing.id)}
            className="flex-1 font-medium leading-tight hover:text-primary"
          >
            {listing.title}
          </Link>
        </div>

        <p className="mt-0.5 text-sm text-gray-500">
          {listing.city}, {listing.country}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {listing.averageRating > 0 && (
              <>
                <span className="flex items-center text-sm">
                  <span className="mr-1">★</span>
                  {listing.averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({listing.reviewCount})
                </span>
              </>
            )}
          </div>
          <p className="font-semibold">
            {formatPrice(listing.pricePerNight)}
            <span className="text-sm font-normal text-gray-500"> / ночь</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 text-5xl">❤️</div>
      <h3 className="text-lg font-semibold">Пока ничего не сохранено</h3>
      <p className="mt-1 max-w-xs text-gray-500">
        Нажмите на сердечко на понравившихся объектах, чтобы добавить их сюда
      </p>
      <Link
        href={URL.HOME}
        className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary/90"
      >
        Найти жильё
      </Link>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-gray-200">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-3">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="mt-1 h-3 w-1/2 rounded bg-gray-200" />
        <div className="mt-2 h-3 w-1/3 rounded bg-gray-200" />
      </div>
    </div>
  );
}

type FavoritesListProps = {
  initialFavorites?: ListingPreview[];
};

export function FavoritesList({ initialFavorites }: FavoritesListProps) {
  const [favorites, setFavorites] = useState<ListingPreview[]>(
    initialFavorites ?? [],
  );
  const [isLoading, setIsLoading] = useState(!initialFavorites);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialFavorites) {
      return;
    }

    const fetchFavorites = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(API.PROFILE_FAVORITES);
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Требуется авторизация');
          }
          throw new Error('Ошибка при загрузке избранного');
        }
        const data = await response.json();
        setFavorites(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [initialFavorites]);

  const handleRemove = async (listingId: string) => {
    try {
      const response = await fetch(API.FAVORITES_DETAIL(listingId), {
        method: 'DELETE',
      });

      if (response.ok) {
        setFavorites((prev) => prev.filter((f) => f.id !== listingId));
      }
    } catch (err) {
      console.error('Failed to remove favorite:', err);
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-600">
        {error}
      </div>
    );
  }

  // Empty
  if (favorites.length === 0) {
    return <EmptyState />;
  }

  // Grid
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {favorites.map((listing) => (
        <FavoriteCard
          key={listing.id}
          listing={listing}
          onRemove={handleRemove}
        />
      ))}
    </div>
  );
}

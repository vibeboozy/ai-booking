/**
 * ANCHOR: profile
 * PURPOSE: Toggle избранного (сердечко) — optimistic UI.
 * Dependencies: POST/DELETE /api/favorites, useFavorites.
 * CRITICAL: Exported to search ListingCard and listing page; data-testid="favorite-toggle".
 *
 * DO:
 * - Optimistic update + rollback on error
 * - Auth required (redirect/login prompt if guest)
 * - Handle loading state gracefully
 * DONT:
 * - Block render if favorites loading on entire page
 */

'use client';

import { useOptimistic, useTransition, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/shared/utils/cn';
import { API, URL } from '@/shared/constants/urls';

type FavoriteButtonProps = {
  listingId: string;
  initialFavorited?: boolean;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
};

// Heart icon SVG components
function HeartIcon({
  filled,
  className,
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

async function toggleFavorite(
  favorited: boolean,
  listingId: string,
): Promise<boolean> {
  const method = favorited ? 'DELETE' : 'POST';
  const url = favorited ? API.FAVORITES_DETAIL(listingId) : API.FAVORITES;
  const body = favorited ? undefined : JSON.stringify({ listingId });

  const response = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body,
  });

  if (response.status === 401) {
    throw { needsAuth: true };
  }

  if (!response.ok) {
    throw new Error('Ошибка при обновлении избранного');
  }

  return !favorited;
}

export function FavoriteButton({
  listingId,
  initialFavorited = false,
  size = 'md',
  showLabel = false,
  className,
}: FavoriteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [optimisticFavorited, setOptimisticFavorited] = useOptimistic(
    initialFavorited,
    (state, newValue: boolean) => newValue,
  );

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
  };

  const handleToggle = async () => {
    if (isPending) return;

    const previousFavorited = optimisticFavorited;
    const nextFavorited = !previousFavorited;

    setError(null);

    startTransition(async () => {
      setOptimisticFavorited(nextFavorited);

      try {
        await toggleFavorite(previousFavorited, listingId);
        router.refresh();
      } catch (err: unknown) {
        setOptimisticFavorited(previousFavorited);
        if (err && typeof err === 'object' && 'needsAuth' in err) {
          router.push(
            `${URL.LOGIN}?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
          );
          return;
        }
        const message =
          err instanceof Error ? err.message : 'Неизвестная ошибка';
        setError(message);
        setTimeout(() => setError(null), 3000);
      }
    });
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        data-testid="favorite-toggle"
        aria-label={
          optimisticFavorited ? 'Удалить из избранного' : 'Добавить в избранное'
        }
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 transition-all',
          'hover:bg-gray-100',
          'focus:outline-none focus:ring-2 focus:ring-primary/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          optimisticFavorited
            ? 'text-red-500 hover:text-red-600'
            : 'text-gray-500 hover:text-gray-600',
          className,
        )}
      >
        <HeartIcon filled={optimisticFavorited} className={sizeClasses[size]} />
        {showLabel && (
          <span className="text-sm font-medium">
            {optimisticFavorited ? 'В избранном' : 'Добавить в избранное'}
          </span>
        )}
      </button>

      {error && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-red-500 px-2 py-1 text-xs text-white">
          {error}
        </div>
      )}
    </div>
  );
}

// Link version for when user needs to login
export function FavoriteButtonWithAuth(
  props: FavoriteButtonProps & { isAuthenticated: boolean },
) {
  if (!props.isAuthenticated) {
    return (
      <Link
        href={`${URL.LOGIN}?callbackUrl=${encodeURIComponent(URL.LISTING(props.listingId))}`}
        className={cn(
          'flex items-center justify-center rounded-full p-2',
          'text-gray-500 hover:text-gray-600',
        )}
        aria-label="Войдите, чтобы добавить в избранное"
      >
        <HeartIcon
          filled={false}
          className={props.size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}
        />
      </Link>
    );
  }

  return <FavoriteButton {...props} />;
}

/**
 * ANCHOR: profile
 * PURPOSE: Hook загрузки trips для профиля.
 * Dependencies: GET /api/profile/trips.
 *
 * DO:
 * - Fetch trips with status filter
 * - Handle loading and error states
 * - Skip fetch if initialData provided (server prefetch)
 * DONT:
 * - Mix upcoming and history without user control
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Trip } from '@/modules/profile/types';
import { API } from '@/shared/constants/urls';

export function useTrips(
  status?: 'upcoming' | 'history',
  initialTrips?: Trip[],
): {
  trips: Trip[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [trips, setTrips] = useState<Trip[]>(initialTrips ?? []);
  const [isLoading, setIsLoading] = useState(initialTrips === undefined);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (status) {
        params.set('status', status);
      }

      const response = await fetch(`${API.PROFILE_TRIPS}?${params.toString()}`);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Требуется авторизация');
        }
        throw new Error('Ошибка при загрузке поездок');
      }

      const data = await response.json();
      setTrips(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(message);
      setTrips([]);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    // Skip fetch if we already have initial data from server
    if (initialTrips !== undefined) {
      return;
    }
    fetchTrips();
  }, [fetchTrips, initialTrips]);

  return {
    trips,
    isLoading,
    error,
    refetch: fetchTrips,
  };
}

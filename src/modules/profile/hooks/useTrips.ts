/**
 * ANCHOR: profile
 * PURPOSE: Hook загрузки trips для профиля.
 * Dependencies: GET /api/profile/trips.
 *
 * DO:
 * - Filter by upcoming|history query param
 * DONT:
 * - Mix upcoming and history without user control
 */

'use client';

import type { Trip } from '@/modules/profile/types';

export function useTrips(_status?: 'upcoming' | 'history'): {
  trips: Trip[];
  isLoading: boolean;
} {
  return { trips: [], isLoading: false };
}

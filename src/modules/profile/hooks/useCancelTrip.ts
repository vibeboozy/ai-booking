/**
 * ANCHOR: profile
 * PURPOSE: Hook для отмены бронирования.
 * Dependencies: cancelTripAction.
 */

'use client';

import { useState, useTransition } from 'react';
import { cancelTripAction } from '@/modules/profile/actions/cancelTrip';

export function useCancelTrip() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const cancelTrip = (bookingId: string) => {
    setError(null);
    startTransition(async () => {
      const result = await cancelTripAction(bookingId);
      if (!result.success && result.error) {
        setError(result.error);
      }
    });
  };

  return { cancelTrip, isPending, error };
}

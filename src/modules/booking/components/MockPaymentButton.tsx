/**
 * ANCHOR: booking
 * PURPOSE: Кнопка mock-оплаты «Забронировать» → POST /api/bookings/mock-pay.
 * Dependencies: POST /api/bookings, POST /api/bookings/mock-pay.
 * CRITICAL: Simulate ~1.5s delay in dev; skip in test (PAYMENT_MOCK_FAST).
 *
 * DO:
 * - data-testid="book-button"
 * - Redirect to /profile/trips?success=true
 * DONT:
 * - Accept real card data
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type MockPaymentButtonProps = {
  bookingId: string;
  disabled?: boolean;
};

export function MockPaymentButton({
  bookingId,
  disabled,
}: MockPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/bookings/mock-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });

      if (res.ok) {
        router.push('/profile/trips?success=true');
      } else {
        console.error('Payment failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || isLoading}
      data-testid="book-button"
      className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? 'Обработка...' : 'Забронировать'}
    </button>
  );
}

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

type MockPaymentButtonProps = {
  bookingId: string;
  disabled?: boolean;
};

export function MockPaymentButton(_props: MockPaymentButtonProps) {
  return null;
}

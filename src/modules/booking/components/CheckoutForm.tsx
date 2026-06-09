/**
 * ANCHOR: booking
 * PURPOSE: Форма чекаут: даты, гости, summary listing, CTA «Забронировать».
 * Dependencies: AvailabilityCalendar, PriceBreakdown, MockPaymentButton, useCheckout.
 * CRITICAL: Все сборы видны до оплаты; auth required.
 *
 * DO:
 * - Reuse AvailabilityCalendar mode="select"
 * DONT:
 * - Скрытые комиссии в UI
 */

'use client';

type CheckoutFormProps = {
  listingId: string;
};

export function CheckoutForm(_props: CheckoutFormProps) {
  return null;
}

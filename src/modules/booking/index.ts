/**
 * ANCHOR: booking
 * PURPOSE: Public API модуля booking (Dev C). Чекаут, цена, mock-оплата.
 * Dependencies: @/modules/listing (AvailabilityCalendar, ListingDetail).
 *
 * DO:
 * - Экспортировать calculateTotalPrice как single source of truth
 * DONT:
 * - Дублировать price formulas в других modules
 */

export { CheckoutForm } from '@/modules/booking/components/CheckoutForm';
export { PriceBreakdown } from '@/modules/booking/components/PriceBreakdown';
export { MockPaymentButton } from '@/modules/booking/components/MockPaymentButton';
export { useCheckout } from '@/modules/booking/hooks/useCheckout';
export { calculateTotalPrice } from '@/modules/booking/utils/calculateTotalPrice';
export type { Booking, BookingCreateInput, PriceBreakdown as PriceBreakdownType } from '@/modules/booking/types';

/**
 * ANCHOR: booking
 * PURPOSE: Отображение разбивки цены: nights × price, fees, TOTAL.
 * Dependencies: @/shared/utils/formatPrice, @/modules/booking/types.
 * CRITICAL: Exported для listing sidebar (optional); все строки explicit.
 *
 * DO:
 * - Показывать cleaningFee, serviceFee отдельными строками
 * DONT:
 * - Скрывать fees в мелком шрифте или tooltip
 */

import type { PriceBreakdown as PriceBreakdownType } from '@/modules/booking/types';

type PriceBreakdownProps = {
  breakdown: PriceBreakdownType;
  listingTitle?: string;
};

export function PriceBreakdown(_props: PriceBreakdownProps) {
  return null;
}

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

import { formatPrice } from '@/shared/utils/formatPrice';
import type { PriceBreakdown as PriceBreakdownType } from '@/modules/booking/types';

type PriceBreakdownProps = {
  breakdown: PriceBreakdownType;
  pricePerNight: number;
  listingTitle?: string;
};

export function PriceBreakdown({
  breakdown,
  pricePerNight,
  listingTitle,
}: PriceBreakdownProps) {
  if (breakdown.nights === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-xl">
        <p className="text-gray-500 text-sm">Выберите даты для расчёта стоимости</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-xl space-y-3">
      {listingTitle && (
        <h3 className="font-medium text-lg">{listingTitle}</h3>
      )}

      <div className="flex justify-between text-sm">
        <span>
          {formatPrice(pricePerNight)} × {breakdown.nights}{' '}
          {breakdown.nights === 1 ? 'ночь' : breakdown.nights < 5 ? 'ночи' : 'ночей'}
        </span>
        <span>{formatPrice(breakdown.subtotal)}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span>Уборка</span>
        <span>{formatPrice(breakdown.cleaningFee)}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span>Сервисный сбор</span>
        <span>{formatPrice(breakdown.serviceFee)}</span>
      </div>

      <div className="border-t pt-3 flex justify-between font-medium">
        <span>Итого</span>
        <span>{formatPrice(breakdown.total)}</span>
      </div>
    </div>
  );
}

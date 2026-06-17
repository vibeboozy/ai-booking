/**
 * ANCHOR: shared
 * PURPOSE: Форматирование цены из копеек в UI-строку.
 * Dependencies: none.
 * CRITICAL: Все цены в БД/API — Int (копейки); display только через formatPrice.
 *
 * DO:
 * - formatPrice(350000) → "3 500 ₽"
 * DONT:
 * - Делить на 100 inline в компонентах
 */

export function formatPrice(amountMinor: number, _currency = 'RUB'): string {
  const rubles = amountMinor / 100;
  return rubles.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }) + ' ₽';
}

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

export function formatPrice(amountMinor: number, currency = 'RUB'): string {
  const amount = amountMinor / 100;
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  const currencySymbols: Record<string, string> = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
  };

  return `${formatted} ${currencySymbols[currency] ?? currency}`;
}

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

const currencySymbols: Record<string, string> = {
  RUB: '₽',
  USD: '$',
  EUR: '€',
};

export function formatPrice(amountMinor: number, currency = 'RUB'): string {
  if (amountMinor < 0) {
    return '-' + formatPrice(-amountMinor, currency);
  }

  const amount = amountMinor / 100;
  const symbol = currencySymbols[currency] || currency;

  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return `${formatted} ${symbol}`;
}
/**
 * ANCHOR: search
 * PURPOSE: Константы для PriceSlider — ценовые границы и шаг.
 * Dependencies: none.
 * CRITICAL: Все значения в копейках (1 ₽ = 100 копеек).
 *
 * DO:
 * - Использовать эти константы вместо magic numbers
 * DONT:
 * - Не использовать напрямую в UI (использовать formatPrice)
 */

export const PRICE_SLIDER_MIN = 0;

export const PRICE_SLIDER_MAX = 100_000_000;

export const PRICE_SLIDER_STEP = 100_000;
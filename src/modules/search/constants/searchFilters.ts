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

export const PRICE_SLIDER_MAX = 10_000_000;

export const PRICE_SLIDER_STEP = 100_000;

export const DEBOUNCE_DELAY_MS = 300;

export const AUTOCOMPLETE_MIN_CHARS = 2;

export const AUTOCOMPLETE_DEFAULT_LIMIT = 5;

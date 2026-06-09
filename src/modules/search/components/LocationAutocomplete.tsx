/**
 * ANCHOR: search
 * PURPOSE: Автокомплит городов/стран (debounced fetch /api/locations/autocomplete).
 * Dependencies: GET /api/locations/autocomplete.
 * CRITICAL: Min 2 chars; debounce 300ms; keyboard + ARIA accessible.
 *
 * DO:
 * - getByRole queries in tests
 * DONT:
 * - Fetch on every keystroke without debounce
 */

export function LocationAutocomplete() {
  return null;
}

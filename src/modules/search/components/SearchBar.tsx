/**
 * ANCHOR: search
 * PURPOSE: Главная форма поиска: город, даты, гости, кнопка «Найти».
 * Dependencies: LocationAutocomplete, @/shared/utils/buildSearchUrl, next/navigation.
 * CRITICAL: Submit → navigate to /search с URL params; без useState для фильтров.
 *
 * DO:
 * - Progressive enhancement (form action fallback)
 * DONT:
 * - Хранить search state только в useState без URL sync
 */

export function SearchBar() {
  return null;
}

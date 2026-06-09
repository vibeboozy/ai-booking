/**
 * ANCHOR: search
 * PURPOSE: Public API модуля search (Dev A). Поиск, автокомплит, фильтры, результаты.
 * Dependencies: @/shared (SearchParams, ListingPreview, parseSearchParams, buildSearchUrl).
 *
 * DO:
 * - Экспортировать только public API из этого файла
 * DONT:
 * - Импортировать внутренности других modules напрямую
 */

export { SearchBar } from '@/modules/search/components/SearchBar';
export { LocationAutocomplete } from '@/modules/search/components/LocationAutocomplete';
export { SearchFilters } from '@/modules/search/components/SearchFilters';
export { ListingCard } from '@/modules/search/components/ListingCard';
export { useSearchFilters } from '@/modules/search/hooks/useSearchFilters';
export type { Location } from '@/modules/search/types';

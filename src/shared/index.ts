/**
 * ANCHOR: shared
 * PURPOSE: Public API shared-слоя (re-export types, utils, constants).
 * Dependencies: все файлы в src/shared/.
 *
 * DO:
 * - Re-export канонических типов и утилит
 * DONT:
 * - Экспортировать module-specific код
 */

export type { ListingPreview, PropertyType, HostPreview } from '@/shared/types/listing';
export type { SearchParams } from '@/shared/schemas/searchParams';
export { parseSearchParams } from '@/shared/utils/parseSearchParams';
export { buildSearchUrl } from '@/shared/utils/buildSearchUrl';
export { formatPrice } from '@/shared/utils/formatPrice';
export { cn } from '@/shared/utils/cn';

import {
  searchParamsSchema,
  type SearchParams,
} from '@/shared/schemas/searchParams';

/**
 * Parses raw Next.js searchParams (Record<string, string | string[] | undefined>)
 * into a validated SearchParams object using Zod schema.
 * Invalid fields are ignored; defaults are applied by the schema (optional).
 */
export function parseSearchParams(
  raw: Record<string, string | string[] | undefined>,
): SearchParams {
  // Convert possible string[] to first element for simplicity, as our schema expects scalar values.
  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) {
      normalized[key] = value[0];
    } else {
      normalized[key] = value;
    }
  }
  const result = searchParamsSchema.safeParse(normalized);
  if (!result.success) {
    // In case of validation errors, return empty object (defaults will be applied downstream).
    return {} as SearchParams;
  }
  return result.data;
}

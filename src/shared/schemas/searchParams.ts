import { z } from 'zod';
import type { PropertyType } from '@/shared/types/listing';

export const searchParamsSchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  checkIn: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  checkOut: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  guests: z.coerce.number().int().min(1).max(16).optional(),
  priceMin: z.coerce.number().int().min(0).optional(),
  priceMax: z.coerce.number().int().min(0).optional(),
  propertyType: z.enum(['apartment', 'house', 'room']).optional(),
  amenities: z.array(z.string()).optional(),
  page: z.coerce.number().int().min(1).optional(),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

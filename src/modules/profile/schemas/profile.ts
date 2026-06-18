/**
 * ANCHOR: profile
 * PURPOSE: Zod-схемы валидации для profile API.
 * Dependencies: zod.
 */

import { z } from 'zod';

/**
 * Schema for GET /api/profile/trips query params
 */
export const tripsQuerySchema = z.object({
  status: z.enum(['upcoming', 'history']).optional(),
});

export type TripsQuery = z.infer<typeof tripsQuerySchema>;

/**
 * Schema for POST /api/favorites body
 */
export const addFavoriteSchema = z.object({
  listingId: z.string().trim().min(1, 'listingId обязателен'),
});

export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>;

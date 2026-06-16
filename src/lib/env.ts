/**
 * ANCHOR: shared
 * PURPOSE: Валидация env-переменных при старте (Zod schema).
 * Dependencies: zod.
 * CRITICAL: Fail fast если отсутствуют DATABASE_URL, NEXTAUTH_SECRET и др.
 *
 * DO:
 * - import { env } from '@/lib/env' вместо process.env
 * DONT:
 * - Читать process.env напрямую в бизнес-логике
 */

import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  AI_PROVIDER_URL: z.string().url().optional(),
  AI_API_KEY: z.string().optional(),
  AI_MODEL_NAME: z.string().min(1).optional(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  AI_PROVIDER_URL: process.env.AI_PROVIDER_URL,
  AI_API_KEY: process.env.AI_API_KEY,
  AI_MODEL_NAME: process.env.AI_MODEL_NAME,
});

export const isGoogleOAuthEnabled = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
);

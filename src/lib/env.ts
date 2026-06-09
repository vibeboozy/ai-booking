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

export {};

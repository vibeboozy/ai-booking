/**
 * ANCHOR: shared
 * PURPOSE: Singleton Prisma Client для всего приложения.
 * Dependencies: @prisma/client.
 * CRITICAL: Единственная точка создания клиента; globalThis guard для dev hot reload.
 *
 * DO:
 * - import { prisma } from '@/lib/prisma'
 * DONT:
 * - new PrismaClient() в route handlers или components
 */

export {};

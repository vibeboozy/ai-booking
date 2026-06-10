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

import { PrismaClient } from '@prisma/client';

declare global {
  // Allow global `prisma` variable to be shared across hot reloads in development.
  // eslint-disable-next-line no-var
  var prisma: PrismaClient;
}

export const prisma = globalThis.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

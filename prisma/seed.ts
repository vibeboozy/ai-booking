/**
 * ANCHOR: shared
 * PURPOSE: Seed-скрипт тестовых данных (locations, listings, users, bookings).
 * Dependencies: @prisma/client, prisma/schema.prisma.
 * CRITICAL: Идемпотентность (upsert). Минимум 3 города, 20 listings.
 *
 * DO:
 * - Использовать upsert для повторного запуска
 * DONT:
 * - create-only без проверки существования
 */

async function main(): Promise<void> {
  // TODO: implement seed
}

main();

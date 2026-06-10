// tests/seed.test.ts
import { execSync } from 'child_process';
import { prisma } from '../src/lib/prisma';
import { expect, test, beforeAll, afterAll } from 'vitest';

// Run the seed script before tests
beforeAll(() => {
  // Ensure a clean database state if needed; here we just run the seed script
  execSync('pnpm db:seed', { stdio: 'inherit' });
});

afterAll(async () => {
  await prisma.$disconnect();
});

test('seed creates expected users, locations, listings and a booking', async () => {
  const users = await prisma.user.findMany();
  const locations = await prisma.location.findMany();
  const listings = await prisma.listing.findMany();
  const bookings = await prisma.booking.findMany();

  expect(users.length).toBeGreaterThanOrEqual(2);
  expect(locations.length).toBeGreaterThanOrEqual(3);
  expect(listings.length).toBeGreaterThanOrEqual(2);
  expect(bookings.length).toBeGreaterThanOrEqual(1);
});

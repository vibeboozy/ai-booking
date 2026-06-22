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

import { hash } from 'bcryptjs';
import {
  BookingStatus,
  LocationType,
  PrismaClient,
  PropertyType,
} from '@prisma/client';

const prisma = new PrismaClient();

const DEV_USER = {
  email: 'dev@tripvibe.dev',
  name: 'Dev User',
  password: 'devpassword',
};

const HOST_USER = {
  email: 'host@tripvibe.dev',
  name: 'Анна Хост',
  password: 'hostpassword',
};

const CITIES = [
  {
    name: 'Москва',
    country: 'Россия',
    slug: 'moscow-ru',
    lat: 55.7558,
    lng: 37.6173,
  },
  {
    name: 'Санкт-Петербург',
    country: 'Россия',
    slug: 'saint-petersburg-ru',
    lat: 59.9343,
    lng: 30.3351,
  },
  {
    name: 'Казань',
    country: 'Россия',
    slug: 'kazan-ru',
    lat: 55.8304,
    lng: 49.0661,
  },
] as const;

const AMENITY_POOL = [
  'wifi',
  'kitchen',
  'parking',
  'washer',
  'ac',
  'tv',
] as const;

const PROPERTY_TYPES = [
  PropertyType.APARTMENT,
  PropertyType.HOUSE,
  PropertyType.ROOM,
] as const;

function listingImage(seed: number): string {
  return `https://placehold.co/800x600/64748b/ffffff?text=Listing+${seed}`;
}

async function upsertUser(
  email: string,
  name: string,
  password: string,
): Promise<string> {
  const passwordHash = await hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { email, name, passwordHash },
  });
  return user.id;
}

async function seedLocations(): Promise<void> {
  for (const city of CITIES) {
    await prisma.location.upsert({
      where: { slug: city.slug },
      update: {
        name: city.name,
        type: LocationType.CITY,
        lat: city.lat,
        lng: city.lng,
      },
      create: {
        name: city.name,
        type: LocationType.CITY,
        slug: city.slug,
        lat: city.lat,
        lng: city.lng,
      },
    });
  }

  await prisma.location.upsert({
    where: { slug: 'russia' },
    update: { name: 'Россия', type: LocationType.COUNTRY },
    create: {
      name: 'Россия',
      type: LocationType.COUNTRY,
      slug: 'russia',
    },
  });
}

async function seedListings(hostId: string): Promise<string[]> {
  const listingIds: string[] = [];
  let index = 0;

  for (const city of CITIES) {
    for (let i = 0; i < 8; i += 1) {
      index += 1;
      const propertyType = PROPERTY_TYPES[i % PROPERTY_TYPES.length];
      const pricePerNight = 250000 + (index % 7) * 50000;
      const title = `${city.name}: уютное жильё #${i + 1}`;
      const id = `seed-listing-${city.slug}-${i + 1}`;

      const listing = await prisma.listing.upsert({
        where: { id },
        update: {
          title,
          description: `Современное жильё в ${city.name}. Идеально для поездок без лишнего трения. Быстрый Wi-Fi, прозрачные цены, честное описание.`,
          city: city.name,
          country: city.country,
          lat: city.lat + (i % 5) * 0.01,
          lng: city.lng + (i % 5) * 0.01,
          pricePerNight,
          cleaningFee: 150000,
          serviceFee: 80000,
          propertyType,
          amenities: AMENITY_POOL.slice(0, 3 + (i % 3)),
          images: [listingImage(index), listingImage(index + 100)],
          hostId,
        },
        create: {
          id,
          title,
          description: `Современное жильё в ${city.name}. Идеально для поездок без лишнего трения. Быстрый Wi-Fi, прозрачные цены, честное описание.`,
          city: city.name,
          country: city.country,
          lat: city.lat + (i % 5) * 0.01,
          lng: city.lng + (i % 5) * 0.01,
          pricePerNight,
          cleaningFee: 150000,
          serviceFee: 80000,
          propertyType,
          amenities: AMENITY_POOL.slice(0, 3 + (i % 3)),
          images: [listingImage(index), listingImage(index + 100)],
          hostId,
        },
      });

      listingIds.push(listing.id);
    }
  }

  return listingIds;
}

async function seedBookings(
  userId: string,
  listingIds: string[],
): Promise<void> {
  // Upcoming booking
  const upcomingId = 'seed-booking-dev-upcoming';
  const listingId = listingIds[0];

  await prisma.booking.upsert({
    where: { id: upcomingId },
    update: {
      userId,
      listingId,
      checkIn: new Date('2026-07-01'),
      checkOut: new Date('2026-07-05'),
      guests: 2,
      totalPrice: 1200000,
      status: BookingStatus.CONFIRMED,
    },
    create: {
      id: upcomingId,
      userId,
      listingId,
      checkIn: new Date('2026-07-01'),
      checkOut: new Date('2026-07-05'),
      guests: 2,
      totalPrice: 1200000,
      status: BookingStatus.CONFIRMED,
    },
  });

  // Completed/archived booking (for review testing)
  const completedId = 'seed-booking-dev-completed';
  const completedListingId = listingIds[1] || listingId;

  await prisma.booking.upsert({
    where: { id: completedId },
    update: {
      userId,
      listingId: completedListingId,
      checkIn: new Date('2026-06-10'),
      checkOut: new Date('2026-06-15'),
      guests: 2,
      totalPrice: 1500000,
      status: BookingStatus.COMPLETED,
    },
    create: {
      id: completedId,
      userId,
      listingId: completedListingId,
      checkIn: new Date('2026-06-10'),
      checkOut: new Date('2026-06-15'),
      guests: 2,
      totalPrice: 1500000,
      status: BookingStatus.COMPLETED,
    },
  });
}

async function main(): Promise<void> {
  const devUserId = await upsertUser(
    DEV_USER.email,
    DEV_USER.name,
    DEV_USER.password,
  );
  const hostId = await upsertUser(
    HOST_USER.email,
    HOST_USER.name,
    HOST_USER.password,
  );

  await seedLocations();
  const listingIds = await seedListings(hostId);
  await seedBookings(devUserId, listingIds);

  console.log(`Seed complete: ${listingIds.length} listings, users ready`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

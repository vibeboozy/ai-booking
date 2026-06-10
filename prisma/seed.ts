import { PropertyType } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';

async function main() {
  // Users (mock)
  const user1 = await prisma.user.upsert({
    where: { email: 'dev1@example.com' },
    update: {},
    create: {
      email: 'dev1@example.com',
      name: 'Dev One',
      passwordHash: await bcrypt.hash('password1', 10),
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'dev2@example.com' },
    update: {},
    create: {
      email: 'dev2@example.com',
      name: 'Dev Two',
      passwordHash: await bcrypt.hash('password2', 10),
    },
  });

  // Locations (3 cities)
  const cities = ['Москва', 'Санкт-Петербург', 'Сочи'];
  for (const city of cities) {
    await prisma.location.upsert({
      where: { slug: city.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        name: city,
        type: 'CITY',
        slug: city.toLowerCase().replace(/\s+/g, '-'),
      },
    });
  }

  // Listings (minimal set, can be expanded)
  const listingsData = [
    {
      title: 'Уютный лофт в центре Москвы',
      description: 'Современный лофт с видом на Кремль.',
      city: 'Москва',
      country: 'Россия',
      lat: 55.7558,
      lng: 37.6173,
      pricePerNight: 500000, // 5000 ₽
      cleaningFee: 50000,
      serviceFee: 30000,
      propertyType: PropertyType.APARTMENT,
      amenities: ['wifi', 'kitchen', 'parking'],
      images: ['https://example.com/loft1.jpg'],
      hostId: user1.id,
    },
    {
      title: 'Дом у моря в Сочи',
      description: 'Просторный дом с частным пляжем.',
      city: 'Сочи',
      country: 'Россия',
      lat: 43.5853,
      lng: 39.7231,
      pricePerNight: 800000,
      cleaningFee: 80000,
      serviceFee: 50000,
      propertyType: PropertyType.HOUSE,
      amenities: ['wifi', 'kitchen'],
      images: ['https://example.com/house1.jpg'],
      hostId: user2.id,
    },
  ];

  for (const data of listingsData) {
    await prisma.listing.create({ data });
  }

  // Bookings (example)
  const listing = await prisma.listing.findFirst({
    where: { title: listingsData[0].title },
  });
  if (listing) {
    await prisma.booking.upsert({
      where: { id: 'seed-booking-1' },
      update: {},
      create: {
        id: 'seed-booking-1',
        userId: user2.id,
        listingId: listing.id,
        checkIn: new Date('2026-07-01'),
        checkOut: new Date('2026-07-05'),
        guests: 2,
        totalPrice:
          4 * listing.pricePerNight + listing.cleaningFee + listing.serviceFee,
        status: 'CONFIRMED',
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

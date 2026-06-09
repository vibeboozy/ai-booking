# TripVibe — Модели данных

Единый справочник по сущностям, связям и TypeScript-типам проекта.  
Источник правды для БД — `prisma/schema.prisma`. Этот документ — человекочитаемая проекция для всей команды.

> Связанные документы: [project_context.md](./project_context.md), [semantic_graph.xml](./semantic_graph.xml), [rules/database_rules.xml](./rules/database_rules.xml), [rules/anchor_standards.xml](./rules/anchor_standards.xml)

---

## Диаграмма связей

```mermaid
erDiagram
    User ||--o{ Listing : hosts
    User ||--o{ Booking : makes
    User ||--o{ Favorite : saves
    User ||--o{ Review : writes

    Listing ||--o{ Booking : has
    Listing ||--o{ Favorite : in
    Listing ||--o{ Review : receives

    Booking |o--o| Review : "one review max"

    User {
        string id PK
        string email UK
        string name
        string avatarUrl
        string passwordHash
        datetime createdAt
        datetime updatedAt
    }

    Listing {
        string id PK
        string title
        text description
        string city
        string country
        float lat
        float lng
        int pricePerNight
        int cleaningFee
        int serviceFee
        enum propertyType
        string[] amenities
        string[] images
        string hostId FK
        float averageRating
        int reviewCount
        datetime createdAt
        datetime updatedAt
    }

    Booking {
        string id PK
        string userId FK
        string listingId FK
        date checkIn
        date checkOut
        int guests
        int totalPrice
        enum status
        datetime createdAt
        datetime updatedAt
    }

    Favorite {
        string id PK
        string userId FK
        string listingId FK
        datetime createdAt
    }

    Review {
        string id PK
        string userId FK
        string listingId FK
        string bookingId FK_UK
        int rating
        text text
        string[] photos
        datetime createdAt
    }

    Location {
        string id PK
        string name
        enum type
        string slug UK
        float lat
        float lng
    }
```

---

## Перечисления (Enums)

| Enum | Значения (Prisma) | Значения (API / URL) | Где используется |
|------|-------------------|----------------------|------------------|
| `PropertyType` | `APARTMENT`, `HOUSE`, `ROOM` | `apartment`, `house`, `room` | Listing, фильтры поиска |
| `BookingStatus` | `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED` | те же, lowercase | Booking, профиль |
| `LocationType` | `CITY`, `COUNTRY` | `city`, `country` | Location, автокомплит |
| `Amenity` | — (массив строк) | `wifi`, `kitchen`, `parking` | Listing, фильтры |
| `AvailabilityDayStatus` | — (вычисляемый) | `free`, `booked`, `past` | Календарь доступности |

**Правило маппинга:** в Prisma — `SCREAMING_SNAKE`, в JSON и URL — `lowercase`.

---

## Модели базы данных (Prisma)

### User

| Поле | Тип | Обяз. | Описание |
|------|-----|-------|----------|
| `id` | `String` (cuid) | да | PK |
| `email` | `String` | да | Уникальный, для входа |
| `name` | `String` | да | Отображаемое имя |
| `avatarUrl` | `String?` | нет | URL аватара |
| `passwordHash` | `String?` | нет | Только для credentials-провайдера |
| `createdAt` | `DateTime` | да | Авто |
| `updatedAt` | `DateTime` | да | Авто |

**Связи:** `listings[]`, `bookings[]`, `favorites[]`, `reviews[]`  
**Owner:** shared

---

### Listing

| Поле | Тип | Обяз. | Описание |
|------|-----|-------|----------|
| `id` | `String` (cuid) | да | PK |
| `title` | `String` | да | Заголовок карточки |
| `description` | `String` @db.Text | да | Полное описание (контекст для ИИ-Консьержа) |
| `city` | `String` | да | Город |
| `country` | `String` | да | Страна |
| `lat` | `Float` | да | Широта для карты |
| `lng` | `Float` | да | Долгота для карты |
| `pricePerNight` | `Int` | да | Цена за ночь в **копейках** |
| `cleaningFee` | `Int` | да | Уборка, копейки |
| `serviceFee` | `Int` | да | Сервисный сбор, копейки |
| `propertyType` | `PropertyType` | да | apartment / house / room |
| `amenities` | `String[]` | да | `["wifi", "kitchen", "parking", ...]` |
| `images` | `String[]` | да | URL фотографий, порядок = порядок в галерее |
| `hostId` | `String` | да | FK → User |
| `averageRating` | `Float` | да | Денормализация, default `0` |
| `reviewCount` | `Int` | да | Денормализация, default `0` |
| `createdAt` | `DateTime` | да | Авто |
| `updatedAt` | `DateTime` | да | Авто |

**Связи:** `host` → User, `bookings[]`, `favorites[]`, `reviews[]`  
**Индексы:** `(city, country)`, `propertyType`, `pricePerNight`, `averageRating`  
**Owner:** listing (Dev B)

> Занятость дат вычисляется из `Booking` со статусом `CONFIRMED` или `PENDING` — отдельной таблицы `AvailabilityBlock` нет.

---

### Booking

| Поле | Тип | Обяз. | Описание |
|------|-----|-------|----------|
| `id` | `String` (cuid) | да | PK |
| `userId` | `String` | да | FK → User (кто бронирует) |
| `listingId` | `String` | да | FK → Listing |
| `checkIn` | `DateTime` @db.Date | да | Дата заезда |
| `checkOut` | `DateTime` @db.Date | да | Дата выезда, **строго > checkIn** |
| `guests` | `Int` | да | 1–16 |
| `totalPrice` | `Int` | да | Итог в копейках, **пересчитывается на сервере** |
| `status` | `BookingStatus` | да | default `PENDING` |
| `createdAt` | `DateTime` | да | Авто |
| `updatedAt` | `DateTime` | да | Авто |

**Связи:** `user` → User, `listing` → Listing, `review?` → Review (0..1)  
**Индексы:** `(userId, status)`, `(listingId, checkIn, checkOut)`  
**Owner:** booking (Dev C)

#### Жизненный цикл статусов

```
PENDING → CONFIRMED → COMPLETED
    ↓         ↓
CANCELLED  CANCELLED
```

| Статус | Когда | UI |
|--------|-------|-----|
| `PENDING` | Создан, оплата не прошла | — |
| `CONFIRMED` | mock-pay успешен | «Предстоящая поездка» |
| `COMPLETED` | `checkOut` в прошлом | «История», доступен отзыв |
| `CANCELLED` | Отмена пользователем | Не блокирует календарь |

---

### Favorite

| Поле | Тип | Обяз. | Описание |
|------|-----|-------|----------|
| `id` | `String` (cuid) | да | PK |
| `userId` | `String` | да | FK → User |
| `listingId` | `String` | да | FK → Listing |
| `createdAt` | `DateTime` | да | Авто |

**Ограничение:** уникальная пара `(userId, listingId)`  
**Owner:** profile (Dev D)

---

### Review

| Поле | Тип | Обяз. | Описание |
|------|-----|-------|----------|
| `id` | `String` (cuid) | да | PK |
| `userId` | `String` | да | FK → User (автор) |
| `listingId` | `String` | да | FK → Listing |
| `bookingId` | `String` | да | FK → Booking, **уникальный** (1 отзыв на бронь) |
| `rating` | `Int` | да | 1–5 звёзд |
| `text` | `String` @db.Text | да | Текст отзыва |
| `photos` | `String[]` | нет | URL загруженных фото |
| `createdAt` | `DateTime` | да | Авто |

**Условия создания:** `booking.userId === currentUser`, `booking.status === COMPLETED`, отзыва ещё нет.  
**Побочный эффект:** обновление `Listing.averageRating` и `Listing.reviewCount`.  
**Owner:** reviews (Dev E)

---

### Location

| Поле | Тип | Обяз. | Описание |
|------|-----|-------|----------|
| `id` | `String` (cuid) | да | PK |
| `name` | `String` | да | «Сочи», «Россия» |
| `type` | `LocationType` | да | `CITY` или `COUNTRY` |
| `slug` | `String` | да | Уникальный, для URL (`sochi`) |
| `lat` | `Float?` | нет | Координаты (опционально) |
| `lng` | `Float?` | нет | Координаты (опционально) |

**Назначение:** автокомплит на главной. Не связана FK с Listing (поиск по `city`/`country` строкой).  
**Owner:** search (Dev A)

---

## TypeScript-типы (API / UI)

Типы ниже — контракт между модулями. Не дублировать в своём модуле — импортировать из указанных путей.

### Общие

```typescript
// src/shared/types/listing.ts
type PropertyType = 'apartment' | 'house' | 'room';

type ListingPreview = {
  id: string;
  title: string;
  city: string;
  country: string;
  pricePerNight: number;   // копейки
  images: string[];
  averageRating: number;
  reviewCount: number;
  propertyType: PropertyType;
};

type HostPreview = {
  id: string;
  name: string;
  avatarUrl?: string;
};
```

### Module: listing

```typescript
// src/modules/listing/types.ts
type ListingDetail = ListingPreview & {
  description: string;
  amenities: string[];
  lat: number;
  lng: number;
  cleaningFee: number;     // копейки
  serviceFee: number;      // копейки
  host: HostPreview;
};

type AvailabilityDay = {
  date: string;            // YYYY-MM-DD
  status: 'free' | 'booked' | 'past';
};
```

### Module: search

```typescript
// src/shared/schemas/searchParams.ts  (Zod → z.infer)
type SearchParams = {
  city?: string;
  country?: string;
  checkIn?: string;        // YYYY-MM-DD
  checkOut?: string;
  guests?: number;         // 1–16, default 2
  priceMin?: number;       // копейки
  priceMax?: number;
  propertyType?: PropertyType;
  amenities?: string[];    // ['wifi', 'kitchen']
  page?: number;           // default 1
};

// src/modules/search/types.ts
type Location = {
  id: string;
  name: string;
  type: 'city' | 'country';
  slug: string;
  lat?: number;
  lng?: number;
};
```

### Module: booking

```typescript
// src/modules/booking/types.ts
type BookingCreateInput = {
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
};

type Booking = {
  id: string;
  userId: string;
  listingId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
};

type PriceBreakdown = {
  nights: number;
  subtotal: number;        // pricePerNight × nights
  cleaningFee: number;
  serviceFee: number;
  total: number;
};
```

### Module: profile

```typescript
// src/modules/profile/types.ts
type Favorite = {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
};

type Trip = {
  booking: Booking;
  listing: ListingPreview;
  canReview: boolean;      // status === 'completed' && нет отзыва
};
```

### Module: reviews

```typescript
// src/modules/reviews/types.ts
type ReviewInput = {
  bookingId: string;
  rating: number;          // 1–5
  text: string;
  photos?: string[];
};

type ReviewPublic = {
  id: string;
  rating: number;
  text: string;
  photos: string[];
  author: {
    name: string;          // «Анна К.» — first name + last initial
    avatarUrl?: string;
  };
  createdAt: string;
};
```

---

## Маппинг: БД → API-типы

| Prisma-модель | API-тип | Где отдаётся | Примечания |
|---------------|---------|--------------|------------|
| `Listing` (select) | `ListingPreview` | search, favorites, profile | Без `description` |
| `Listing` (full) | `ListingDetail` | GET `/api/listings/[id]` | + host relation |
| `Booking` + `Listing` | `Trip` | GET `/api/profile/trips` | JOIN + `canReview` |
| `Review` + `User` | `ReviewPublic` | GET `/api/listings/[id]/reviews` | PII автора маскируется |
| `Location` | `Location` | autocomplete | Как есть |
| — (computed) | `AvailabilityDay[]` | GET `.../availability` | Из Booking dates |
| — (computed) | `PriceBreakdown` | checkout, booking API | `calculateTotalPrice()` |

---

## Деньги: единые правила

| Контекст | Формат | Пример |
|----------|--------|--------|
| БД (`pricePerNight`, `totalPrice`, fees) | `Int`, копейки | `350000` = 3 500 ₽ |
| TypeScript / JSON API | `number`, копейки | `{ "pricePerNight": 350000 }` |
| UI | `formatPrice(cents)` | `"3 500 ₽"` |
| URL (`priceMin`, `priceMax`) | integer, копейки | `?priceMax=500000` |

Клиент **не** передаёт `totalPrice` как источник правды — сервер пересчитывает через `calculateTotalPrice()`.

---

## Карта владения моделями

| Модель / тип | Owner | CRUD через |
|--------------|-------|------------|
| `User` | shared | NextAuth |
| `Listing` | Dev B (listing) | listing repository |
| `Booking` | Dev C (booking) | booking repository |
| `Favorite` | Dev D (profile) | profile repository |
| `Review` | Dev E (reviews) | reviews repository |
| `Location` | Dev A (search) | search repository |
| `SearchParams`, `ListingPreview` | shared | — |
| `PriceBreakdown` | Dev C (booking) | `calculateTotalPrice()` |

Изменение полей модели — PR от owner-модуля. Изменение shared-типов — согласование со всеми consumers (см. `semantic_graph.xml` → contracts).

---

## Примеры JSON-ответов API

### ListingPreview (карточка в поиске)

```json
{
  "id": "clx123abc",
  "title": "Лофт с видом на море",
  "city": "Сочи",
  "country": "Россия",
  "pricePerNight": 450000,
  "images": ["https://cdn.tripvibe.dev/listings/1/hero.jpg"],
  "averageRating": 4.8,
  "reviewCount": 23,
  "propertyType": "apartment"
}
```

### PriceBreakdown (чекаут)

```json
{
  "nights": 7,
  "subtotal": 3150000,
  "cleaningFee": 150000,
  "serviceFee": 94500,
  "total": 3394500
}
```

### Trip (профиль)

```json
{
  "booking": {
    "id": "clx456def",
    "userId": "clxuser1",
    "listingId": "clx123abc",
    "checkIn": "2026-07-01",
    "checkOut": "2026-07-08",
    "guests": 2,
    "totalPrice": 3394500,
    "status": "confirmed",
    "createdAt": "2026-06-15T10:30:00.000Z"
  },
  "listing": { "...": "ListingPreview" },
  "canReview": false
}
```

---

## Чеклист для разработчика

- [ ] Импортирую типы из `shared/` или `modules/*/index.ts`, не объявляю свои дубликаты
- [ ] Цены храню и передаю в копейках (`Int` / `number`)
- [ ] Enum в API — lowercase, в Prisma — UPPER_SNAKE
- [ ] Даты — ISO `YYYY-MM-DD` в API и URL
- [ ] Перед изменением поля модели — проверил owner в таблице выше
- [ ] `ListingPreview` не содержит `description` (тяжёлое поле только в `ListingDetail`)

# TripVibe — Project Context

## Vision

TripVibe — современная платформа бронирования жилья для поколения Z («убийца Booking»). Приоритеты: скорость, прозрачность цен, визуальная привлекательность, минимум трения в UX.

## Документация проекта

| Файл | Назначение |
|------|------------|
| [data_models.md](./data_models.md) | Модели данных, связи, TypeScript-типы, API-контракты |
| [semantic_graph.xml](./semantic_graph.xml) | Модули и их взаимодействие |
| [dev_plan.xml](./dev_plan.xml) | Этапы разработки |
| [rules/](./rules/) | Стандарты кода, БД, безопасности, тестов |

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | **Next.js 15** (App Router) | SSR/SSG, Server Actions, единый full-stack |
| Language | **TypeScript** (strict) | Типобезопасность при параллельной разработке 5 модулей |
| Styling | **Tailwind CSS** + **shadcn/ui** | Быстрая сборка UI, единый дизайн-система |
| State (client) | **React hooks** + **nuqs** / `useSearchParams` | URL как единственный источник правды для фильтров |
| Data fetching | **Server Components** + **TanStack Query** (client) | RSC для начальной загрузки, React Query для интерактива |
| Database | **PostgreSQL** + **Prisma ORM** | Реляционная модель (users, listings, bookings, reviews) |
| Auth | **NextAuth.js v5** (Auth.js) | OAuth + credentials, session в JWT/cookie |
| Maps | **OpenStreetMap** (static) | Маркер на карточке объекта, без API-ключа |
| AI | **Vercel AI SDK** (`ai`, `@ai-sdk/openai`) | ИИ-Консьерж на странице жилья |
| Validation | **Zod** | Схемы для API, форм, URL-параметров |
| Testing | **Vitest** + **Playwright** | Unit/integration + E2E критических флоу |
| Linting | **ESLint** + **Prettier** | Единый стиль кода |

## Architectural Principles

1. **URL-driven UI** — все фильтры поиска и результаты синхронизируются с query-параметрами (`?city=...&checkIn=...&priceMax=...`). Без полной перезагрузки страницы.
2. **Module boundaries** — проект разделён на 5 модулей (см. `semantic_graph.xml`). Каждый модуль владеет своей директорией и публичным API (types, hooks, components).
3. **Shared kernel** — общие типы, утилиты, UI-примитивы живут в `src/shared/`. Модули не импортируют внутренности друг друга напрямую.
4. **Server-first data** — чтение данных через Server Components и Route Handlers; мутации через Server Actions.
5. **Transparent pricing** — итоговая цена на чекауте включает все сборы. Никаких скрытых комиссий в UI.
6. **Progressive enhancement** — базовый поиск работает без JS; интерактив (автокомплит, слайдеры) — поверх.
7. **Mock payment** — оплата имитируется (`POST /api/bookings/mock-pay`). Интерфейс готов к замене на Stripe позже.
8. **URL & API constants** — все URL-адреса (URL) и API-эндпоинты (API) определяются в `src/shared/constants/urls.ts`. При использовании `router.push`, `redirect`, `Link href`, `fetch` — импортировать и использовать константы.

## Project Structure

```
src/
├── ANCHORS.md              # Формат якорной разметки
├── app/                    # Next.js App Router (pages, layouts, API routes)
│   ├── (marketing)/        # Главная, лендинг
│   ├── search/             # Module 1: результаты поиска
│   ├── listings/[id]/      # Module 2: карточка объекта
│   ├── checkout/           # Module 3: бронирование
│   ├── profile/            # Module 4: личный кабинет
│   └── api/                # Route Handlers
├── modules/
│   ├── search/             # Dev A — поиск и фильтрация
│   ├── listing/            # Dev B — карточка, галерея, карта
│   ├── booking/            # Dev C — процесс бронирования
│   ├── profile/            # Dev D — профиль, избранное
│   └── reviews/            # Dev E — отзывы и рейтинги
├── shared/                 # Типы, UI-kit, utils, constants
└── lib/                    # Prisma client, auth config, AI client
```

## Module Ownership

| Module | Owner | Scope |
|--------|-------|-------|
| `search` | Dev A | Главная форма поиска, автокомплит, страница результатов, фильтры |
| `listing` | Dev B | Галерея, карта, описание, календарь доступности, ИИ-Консьерж |
| `booking` | Dev C | Чекаут, выбор дат, расчёт цены, mock-оплата |
| `profile` | Dev D | Будущие трипы, история, избранное (сердечки) |
| `reviews` | Dev E | Форма отзыва, звёзды, агрегация рейтингов |

## Cross-Cutting Features

- **ИИ-Консьерж** (Dev B + shared AI lib): виджет на странице жилья. Контекст = `description` + `amenities` объекта. Vercel AI SDK, streaming-ответ.
- **Избранное**: toggle-сердечко на карточках и странице объекта. Хранится в БД, привязано к `userId`.
- **Календарь доступности**: занятые даты из таблицы `bookings`; свободные — selectable на чекауте.

## Non-Functional Requirements

| NFR | Target |
|-----|--------|
| Time to Interactive (search results) | < 2 s на 3G |
| Filter update latency | < 300 ms (client-side + debounced URL sync) |
| Lighthouse Performance | ≥ 90 |
| Accessibility | WCAG 2.1 AA |
| Mobile-first | ≥ 60 % трафика — мобильные |
| SEO | SSR для `/search`, `/listings/[id]` |
| i18n-ready | Строки через constants; RU на старте |

## Environment Variables

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
AI_PROVIDER_URL=        # ИИ-Консьерж
AI_API_KEY=
AI_MODEL_NAME=
NEXT_PUBLIC_MAPBOX_TOKEN=
```

## Definition of Done (project-level)

- [ ] Все 5 модулей интегрированы в один Next.js проект
- [ ] E2E: поиск → фильтр → просмотр → бронирование → профиль
- [ ] URL-параметры восстанавливают состояние при refresh/share
- [ ] ИИ-Консьерж отвечает только на основе данных объекта
- [ ] Отзыв доступен только после завершённой поездки

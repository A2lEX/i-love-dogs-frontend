# CLAUDE.md — DogCare Frontend

> Автоматически читается Claude Code при запуске в корне этого репозитория.

---

## TL;DR

**DogCare Frontend** — Next.js SSR/SSG приложение, потребляет REST API из бекенда.

**Парный репозиторий:** `dogcare-backend` (NestJS). API спека — источник правды для типов.

**Полная архитектура:** `docs/ARCHITECTURE.md`
**Интеграция с API:** `docs/API_INTEGRATION.md`
**Прогресс:** `docs/ROADMAP.md`

---

## Стек

| Слой | Технология | Версия |
|---|---|---|
| Framework | Next.js | 14+ (App Router) |
| Language | TypeScript | 5.x (strict) |
| Styling | Tailwind CSS | 3.x |
| UI Components | shadcn/ui | — |
| State (server) | TanStack Query (React Query) | 5.x |
| State (client) | Zustand | 4.x |
| Forms | react-hook-form + zod | — |
| HTTP client | Native fetch + typed wrapper | — |
| API types | openapi-typescript (codegen) | — |
| Testing | Vitest + React Testing Library | — |
| E2E | Playwright | — |
| Deploy | Vercel | — |

---

## Архитектурные принципы

1. **Server Components по умолчанию.** Client Components только где нужна интерактивность (formы, hooks).
2. **Типы — из OpenAPI.** Никаких ручных интерфейсов для API-моделей. Всё генерируется.
3. **Server Actions для мутаций.** Где возможно, вместо Client Components + fetch.
4. **Кэширование через TanStack Query.** Для клиентских запросов и мутаций.
5. **Один источник правды на layer.** Server state — в React Query cache. Client state — в Zustand. Form state — в react-hook-form.

---

## Ключевые инварианты

1. **Не хардкодим API типы.** Всегда из сгенерированных `@/types/api`.
2. **Не хранить access_token в localStorage.** Только httpOnly cookie через middleware.
3. **Refresh token не виден клиентскому коду.** Refresh flow работает только на сервере (Server Actions или Route Handlers).
4. **Для всех пользовательских форм — zod схемы.** Те же правила валидации, что на бекенде.
5. **Money values — integer minor units.** Отображение через util `formatMoney(amount, currency)`.
6. **Idempotency-Key генерируется на клиенте (crypto.randomUUID).** Отправляется на бекенд для POST /payments и POST /donations.

---

## Текущий этап

**Статус:** ⬜ Этап 1 — Каркас и дизайн-система (не начат)

Обновляй после каждого закрытого этапа. Детали в `docs/ROADMAP.md`.

---

## Синхронизация типов с бекендом

Backend генерирует OpenAPI спеку в `/api-json`. Фронт тянет её и генерирует типы.

### Скрипт

```bash
npm run gen:api
```

Внутри:
```bash
# package.json
"gen:api": "openapi-typescript https://api.dogcare.ru/api-json -o src/types/api.ts"
```

Для dev окружения:
```bash
"gen:api:local": "openapi-typescript http://localhost:3000/api-json -o src/types/api.ts"
```

### Использование

```typescript
import type { paths } from '@/types/api';

// Тип ответа GET /dogs
type DogsResponse = paths['/dogs']['get']['responses']['200']['content']['application/json'];

// Тип элемента массива
type Dog = DogsResponse['data'][number];

// Тип body запроса POST /auth/login
type LoginBody = paths['/auth/login']['post']['requestBody']['content']['application/json'];
```

### Обёртка для удобства

В `src/lib/api-client.ts` — типизированная обёртка:

```typescript
const response = await apiClient.GET('/dogs', { params: { query: { city: 'Moscow' } } });
// response.data — уже типизирован как DogsResponse
```

### Правило

**Любое использование API типов — только через генерированные типы.** Если типа нет в API — значит это client-only модель, живёт в `@/types/ui`.

---

## Структура проекта (App Router)

```
src/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Публичные роуты (без auth)
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Главная
│   │   ├── dogs/
│   │   │   ├── page.tsx          # Каталог
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Профиль собаки
│   │   │       ├── goals/page.tsx
│   │   │       └── reports/page.tsx
│   │   └── donate/
│   │       └── anonymous/page.tsx
│   │
│   ├── (auth)/                   # Auth flows
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (authenticated)/          # Требует login
│   │   ├── layout.tsx            # С проверкой auth в middleware
│   │   ├── profile/page.tsx
│   │   ├── patronages/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── walks/
│   │   │   └── page.tsx
│   │   └── payments/
│   │       └── history/page.tsx
│   │
│   ├── (curator)/                # role: curator
│   │   ├── layout.tsx            # С проверкой роли
│   │   ├── dashboard/page.tsx
│   │   └── dogs/
│   │       ├── new/page.tsx
│   │       └── [id]/
│   │           ├── edit/page.tsx
│   │           ├── goals/page.tsx
│   │           └── reports/new/page.tsx
│   │
│   ├── (admin)/                  # role: admin
│   │   ├── layout.tsx
│   │   ├── curators/page.tsx
│   │   ├── users/page.tsx
│   │   └── stats/page.tsx
│   │
│   ├── api/                      # Route Handlers
│   │   └── auth/
│   │       ├── callback/route.ts # Refresh flow
│   │       └── logout/route.ts
│   │
│   ├── layout.tsx                # Root layout
│   ├── error.tsx
│   ├── not-found.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                       # shadcn/ui компоненты
│   ├── dogs/
│   │   ├── DogCard.tsx
│   │   ├── DogFilters.tsx
│   │   └── DogsGrid.tsx
│   ├── goals/
│   │   ├── GoalCard.tsx
│   │   └── GoalProgress.tsx
│   ├── payments/
│   │   ├── DonationForm.tsx
│   │   └── PatronageForm.tsx
│   ├── walks/
│   │   └── WalkCalendar.tsx
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
│
├── lib/
│   ├── api-client.ts             # Типизированный fetch wrapper
│   ├── auth.ts                   # Server-side auth helpers
│   ├── cookies.ts                # Cookie helpers
│   ├── format.ts                 # formatMoney, formatDate
│   └── cn.ts                     # classnames utility
│
├── hooks/
│   ├── useDogs.ts                # React Query hooks
│   ├── useGoals.ts
│   ├── usePatronages.ts
│   └── useAuth.ts
│
├── stores/                       # Zustand stores
│   └── useUIStore.ts
│
├── schemas/                      # Zod schemas (зеркало бекендовых DTO)
│   ├── auth.ts
│   ├── dogs.ts
│   └── payments.ts
│
├── types/
│   ├── api.ts                    # AUTO-GENERATED (не править!)
│   └── ui.ts                     # Client-only типы
│
├── middleware.ts                 # Next.js middleware (auth check)
│
└── env.mjs                       # Типизированный env через @t3-oss/env-nextjs
```

---

## Конвенции кода

### React / Next.js

- **Server Components по умолчанию** — добавляй `'use client'` только когда нужно (useState, useEffect, onClick handlers, браузерные API)
- **data fetching в Server Components** через fetch с `next: { revalidate, tags }`
- **Server Actions** (`'use server'`) для мутаций, когда возможно
- **React Query** только в Client Components
- **Suspense boundaries** для асинхронных Server Components
- **loading.tsx и error.tsx** в каждой значимой ветке роутинга

### TypeScript

- `strict: true`, никаких `any`
- `noUncheckedIndexedAccess: true`
- Никаких `!` non-null assertions без комментария
- Алиасы: `@/` → `src/`
- Импорты типов через `import type { Dog } from ...`

### Стили

- Tailwind классы через `cn()` utility для условных
- Кастомные стили через Tailwind config или CSS modules (никаких inline styles)
- Design tokens — в `tailwind.config.ts`
- Dark mode через `next-themes` + `dark:` prefix

### Формы

- `react-hook-form` + `zod` resolver
- Валидация на клиенте И на сервере (Server Action дополнительно валидирует)
- Используем shadcn/ui Form компоненты

### Именование файлов

- Компоненты: PascalCase `DogCard.tsx`
- Hooks: camelCase с префиксом `use` — `useDogs.ts`
- Utils: camelCase `formatMoney.ts`
- Types: PascalCase `Dog.ts`
- Routes: kebab-case `my-dogs/page.tsx`

---

## Чего НЕ делать

1. **Не хранить access_token в localStorage / sessionStorage.** Только httpOnly cookie.
2. **Не писать API типы руками.** Только из `@/types/api` (генерация из OpenAPI).
3. **Не делать fetch из Client Components без React Query.** Иначе не будет кэширования, retry, deduplication.
4. **Не использовать `any` в обработке ошибок.** Типизированные error handlers.
5. **Не хардкодить URLs API.** Только через `env.NEXT_PUBLIC_API_URL`.
6. **Не показывать суммы в виде минорных единиц.** Всегда через `formatMoney(amount, currency)` (делит на 100 для RUB).
7. **Не дёргать бекенд из браузера напрямую для чувствительных действий.** Идут через Server Actions или Route Handlers.
8. **Не мутировать React Query cache руками.** Только через `invalidateQueries` или `setQueryData` в колбеках мутаций.
9. **Не использовать `useEffect` для data fetching.** Есть Server Components и React Query.
10. **Не коммитить `.env.local`.** Только `.env.example`.

---

## Auth flow (важно)

Access token живёт в **httpOnly cookie** (не виден JS). Refresh token живёт там же.

### Login

```
1. Форма POST → Server Action "login"
2. Server Action → fetch(`${API_URL}/auth/login`)
3. Получаем {access_token, refresh_token}
4. Ставим обе куки httpOnly + secure + sameSite=lax
5. redirect('/profile')
```

### Протухший access token

```
1. fetch → 401 token_expired
2. Middleware перехватывает → /api/auth/refresh
3. Route Handler: fetch(`${API_URL}/auth/refresh`, { refresh_token })
4. Новые куки, retry исходного запроса
```

### Logout

```
1. POST /api/auth/logout → Route Handler
2. fetch(`${API_URL}/auth/logout`)
3. Удаляем куки
4. redirect('/')
```

### Client Components читают auth

Через `useAuth()` hook — он фетчит `/auth/me` один раз и кэширует. Токен не виден клиентскому коду.

---

## Деплой на Vercel

### Environment variables

| Variable | Значение |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.dogcare.ru/api/v1` (prod), `http://localhost:3000/api/v1` (dev) |
| `API_INTERNAL_URL` | То же что `NEXT_PUBLIC_API_URL`, но без префикса — используется Server-side |
| `NEXT_PUBLIC_SITE_URL` | `https://dogcare.ru` |

### Branch previews

Каждый PR → preview deployment на Vercel. Backend доступен по общему URL `https://api.dogcare.ru` (не меняется). CORS на бекенде разрешает `*.vercel.app` через regex.

### Build settings

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

---

## Performance targets

| Метрика | Target |
|---|---|
| Lighthouse Performance | ≥ 90 |
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| Bundle size (initial) | < 200 KB gzip |

---

## Команды

```bash
# Dev
npm run dev                  # Next.js dev server (порт 3001)
npm run typecheck
npm run lint
npm run format

# API types
npm run gen:api              # Генерация из prod API
npm run gen:api:local        # Генерация из localhost

# Tests
npm run test                 # Vitest
npm run test:e2e             # Playwright
npm run test:cov

# Build
npm run build
npm run start                # Production server локально
```

---

## Связанные документы

- `docs/ARCHITECTURE.md` — структура, роутинг, компоненты
- `docs/API_INTEGRATION.md` — как потреблять API, типы, ошибки
- `docs/ROADMAP.md` — этапы, прогресс
- `docs/DESIGN_SYSTEM.md` — UI гайдлайны (когда будет)

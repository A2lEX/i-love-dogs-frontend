# ARCHITECTURE.md — DogCare Frontend

> Архитектура клиентского приложения на Next.js.

**Версия:** 1.0
**Обновлено:** 2026-04-21
**Статус:** Living document

---

## Содержание

1. [Обзор](#1-обзор)
2. [Архитектурные решения](#2-архитектурные-решения)
3. [Структура роутинга](#3-структура-роутинга)
4. [Data fetching стратегия](#4-data-fetching-стратегия)
5. [State management](#5-state-management)
6. [Компонентная архитектура](#6-компонентная-архитектура)
7. [Auth и security](#7-auth-и-security)
8. [Формы и валидация](#8-формы-и-валидация)
9. [Стилизация и дизайн](#9-стилизация-и-дизайн)
10. [Деплой](#10-деплой)
11. [Performance](#11-performance)
12. [Observability](#12-observability)

---

## 1. Обзор

### 1.1. Назначение

Клиентское веб-приложение для платформы DogCare. Предоставляет три UX-контекста:

1. **Публичный (без авторизации):** каталог собак, карточки, анонимные донаты
2. **Пользовательский (donor):** профиль, патронажи, прогулки, история платежей
3. **Кураторский (curator):** дашборд, управление собаками, цели, отчёты
4. **Админский (admin):** верификация кураторов, модерация, статистика

### 1.2. Ограничения

- **Стек зафиксирован:** Next.js 14+, TypeScript, Tailwind, shadcn/ui
- **Деплой на Vercel** (monorepo не используется по историческим причинам)
- **Backend в отдельном репо.** Источник типов — OpenAPI спека.
- **Поддержка:** Chrome/Safari/Firefox последние 2 версии, мобильные браузеры

---

## 2. Архитектурные решения

### ADR-F01: Next.js App Router

**Решение.** App Router (не Pages Router).
**Почему.** Server Components снижают bundle size, Server Actions упрощают формы, Streaming UX. Pages Router — legacy путь в Next.js 14+.

### ADR-F02: Server Components по умолчанию

**Решение.** Все компоненты — серверные, пока не требуется интерактивность.
**Почему.** Меньше JS в браузере, лучше SEO, прямой доступ к API без client-server hop.
**Критерии клиентского компонента:**
- Hooks (useState, useEffect, useReducer)
- Browser APIs (localStorage, Geolocation)
- Event handlers (onClick, onChange)
- Third-party client libs (React Query provider)

### ADR-F03: Типы из OpenAPI

**Решение.** Все типы API моделей генерируются из `/api-json` через `openapi-typescript`.
**Почему.** Single source of truth, автоматическая синхронизация, zero-cost при изменениях бекенда.
**Минус.** Нужно регенерировать при изменении API. Решается CI скриптом.

### ADR-F04: httpOnly cookies для JWT

**Решение.** Access + refresh tokens хранятся в httpOnly cookies, не в localStorage.
**Почему.** Защита от XSS. Клиентский JS не может прочитать токены.
**Следствие.** Refresh flow работает только на сервере (Route Handler или Server Action). `useAuth()` hook использует `/auth/me` для получения юзера.

### ADR-F05: TanStack Query для server state

**Решение.** React Query для клиентских запросов (в Client Components).
**Почему.** Кэширование, deduplication, refetch on focus, optimistic updates из коробки.
**Зона ответственности:**
- Server Components → нативный fetch с Next.js caching
- Client Components → TanStack Query
- Server Actions → revalidateTag / revalidatePath

### ADR-F06: Zustand для client state

**Решение.** Zustand (не Redux, не Context) для client-only state.
**Почему.** Малый bundle size, простой API, отличная TS поддержка. Redux overkill для наших нужд.
**Область применения:** UI state (модалки, тема, мобильное меню), НЕ для server state.

### ADR-F07: Zod для валидации

**Решение.** Zod схемы для всех user input.
**Почему.** Type inference из схемы, runtime валидация, работает на сервере и на клиенте.
**Следствие.** Каждый `CreateDogDto` из бекенда имеет зеркальную `createDogSchema` на фронте.

### ADR-F08: shadcn/ui для компонентов

**Решение.** shadcn/ui + Tailwind, не Material UI / Chakra.
**Почему.** Copy-paste вместо dependency, полный контроль, хорошая DX, design tokens через Tailwind.

---

## 3. Структура роутинга

### 3.1. Route groups

Next.js App Router поддерживает route groups через `(name)/` — не влияют на URL, но позволяют группировать layouts.

| Группа | URL prefix | Auth | Layout |
|---|---|---|---|
| `(public)` | / | Не требуется | Public header |
| `(auth)` | / | Redirect if logged | Minimal |
| `(authenticated)` | / | Требует login | User header + sidebar |
| `(curator)` | / | Требует role=curator | Curator dashboard |
| `(admin)` | / | Требует role=admin | Admin panel |

### 3.2. Полная карта роутов

```
/                              → Главная (public)
/dogs                          → Каталог собак (public)
/dogs/:id                      → Профиль собаки (public)
/dogs/:id/goals                → Все цели собаки (public)
/dogs/:id/reports              → Все отчёты собаки (public)
/donate/anonymous?goal_id=     → Анонимный донат (public)

/login                         → Логин (auth)
/register                      → Регистрация (auth)
/forgot-password               → Восстановление (auth)

/profile                       → Мой профиль (authenticated)
/patronages                    → Мои патронажи (authenticated)
/patronages/:id                → Детали патронажа (authenticated)
/walks                         → Мои прогулки (authenticated)
/payments/history              → История платежей (authenticated)

/curator/dashboard             → Дашборд куратора (curator)
/curator/dogs/new              → Добавить собаку (curator)
/curator/dogs/:id/edit         → Редактировать собаку (curator)
/curator/dogs/:id/goals        → Управление целями (curator)
/curator/dogs/:id/reports/new  → Новый отчёт (curator)

/admin/curators                → Верификация кураторов (admin)
/admin/users                   → Управление юзерами (admin)
/admin/dogs                    → Все собаки (admin)
/admin/payments                → Все платежи (admin)
/admin/stats                   → Статистика (admin)
```

### 3.3. Middleware для auth

`src/middleware.ts` проверяет auth cookie на защищённых роутах:

```typescript
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');

  if (request.nextUrl.pathname.startsWith('/curator')) {
    if (!token) return NextResponse.redirect(new URL('/login', request.url));
    const user = await verifyToken(token.value);
    if (user.role !== 'curator' && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Аналогично для /admin, /profile и т.д.
}

export const config = {
  matcher: ['/profile/:path*', '/patronages/:path*', '/walks/:path*',
            '/curator/:path*', '/admin/:path*']
};
```

---

## 4. Data fetching стратегия

### 4.1. Матрица решений

| Сценарий | Подход |
|---|---|
| Статический контент (главная, FAQ) | SSG с `generateStaticParams` |
| Каталог собак (меняется редко) | SSR с `revalidate: 60` |
| Профиль собаки | SSR с `revalidate: 300` + `revalidateTag('dog-{id}')` |
| Дашборд юзера | SSR без кэша (`no-store`) |
| Форма с интерактивностью | Client Component + React Query |
| Мутации из форм | Server Actions |
| Реальное время (новые донаты) | React Query + polling / SSE (future) |

### 4.2. Server Components fetch

```typescript
// src/app/(public)/dogs/page.tsx
export default async function DogsPage({ searchParams }: { searchParams: { city?: string } }) {
  const response = await fetch(
    `${process.env.API_INTERNAL_URL}/dogs?city=${searchParams.city ?? ''}`,
    { next: { revalidate: 60, tags: ['dogs'] } }
  );
  const data: DogsResponse = await response.json();

  return <DogsGrid dogs={data.data} pagination={data.pagination} />;
}
```

### 4.3. Client Components с React Query

```typescript
// src/hooks/useDogs.ts
export function useDogs(filters: DogFilters) {
  return useQuery({
    queryKey: ['dogs', filters],
    queryFn: () => apiClient.GET('/dogs', { params: { query: filters } }),
    staleTime: 60_000,
  });
}

// Использование в Client Component
'use client';
export function DogsFilterBar() {
  const [filters, setFilters] = useState<DogFilters>({ city: 'Moscow' });
  const { data, isLoading } = useDogs(filters);
  // ...
}
```

### 4.4. Server Actions для мутаций

```typescript
// src/app/actions/dogs.ts
'use server';

export async function createDog(formData: FormData) {
  const parsed = createDogSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten() };

  const token = cookies().get('access_token')?.value;
  const response = await fetch(`${process.env.API_INTERNAL_URL}/curator/dogs`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(parsed.data),
  });

  if (!response.ok) return { error: await response.json() };

  revalidateTag('dogs');
  redirect('/curator/dashboard');
}
```

---

## 5. State management

### 5.1. Разделение ответственности

```
┌─────────────────────────────────────────────┐
│ SERVER STATE — кэширует React Query        │
│ - Данные с API (dogs, goals, patronages)   │
│ - Invalidation при мутациях                │
└─────────────────────────────────────────────┘
                    +
┌─────────────────────────────────────────────┐
│ CLIENT STATE — Zustand stores              │
│ - UI: модалки, sidebar, theme              │
│ - Draft формы (если не react-hook-form)    │
└─────────────────────────────────────────────┘
                    +
┌─────────────────────────────────────────────┐
│ FORM STATE — react-hook-form               │
│ - Локально в рамках формы                  │
│ - Интеграция с zod                         │
└─────────────────────────────────────────────┘
                    +
┌─────────────────────────────────────────────┐
│ URL STATE — searchParams                   │
│ - Фильтры каталога                         │
│ - Пагинация                                │
│ - Шарабельное состояние                    │
└─────────────────────────────────────────────┘
```

### 5.2. Пример Zustand store

```typescript
// src/stores/useUIStore.ts
interface UIStore {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  activeModal: 'donation' | 'patronage' | null;
  setActiveModal: (modal: UIStore['activeModal']) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  activeModal: null,
  setActiveModal: (modal) => set({ activeModal: modal }),
}));
```

---

## 6. Компонентная архитектура

### 6.1. Иерархия

```
src/components/
├── ui/                    # shadcn/ui примитивы (Button, Card, Dialog, ...)
├── layout/                # Header, Footer, Sidebar
├── {feature}/             # По фичам
│   ├── DogCard.tsx        # Переиспользуемые
│   ├── DogFilters.tsx     # Feature-specific
│   └── index.ts           # Barrel экспорт
└── providers/             # React context providers (ThemeProvider, QueryProvider)
```

### 6.2. Конвенции компонентов

- **Один файл = один компонент** (за исключением внутренних sub-components)
- **Props типизированы через interface** с именем `{ComponentName}Props`
- **Default export** для страниц, **named export** для всех остальных
- **'use client'** на первой строке файла (если применимо)
- **Минимум логики в JSX** — выносим в hooks или utility функции

### 6.3. Паттерны

#### Compound Components

```typescript
<DogCard>
  <DogCard.Image src={dog.cover_photo_url} />
  <DogCard.Header title={dog.name} subtitle={dog.breed} />
  <DogCard.Body>
    <GoalProgress goals={dog.goals} />
  </DogCard.Body>
  <DogCard.Footer>
    <Link href={`/dogs/${dog.id}`}>Подробнее</Link>
  </DogCard.Footer>
</DogCard>
```

#### Container / Presentation

```typescript
// Server Component (container)
async function DogsPage() {
  const dogs = await fetchDogs();
  return <DogsGrid dogs={dogs} />;
}

// Client Component (presentation)
'use client';
function DogsGrid({ dogs }: { dogs: Dog[] }) {
  return <div className="grid">{dogs.map(d => <DogCard key={d.id} dog={d} />)}</div>;
}
```

---

## 7. Auth и security

### 7.1. Хранение токенов

```
┌──────────────────┐
│   Browser        │
│                  │
│   Cookies:       │
│   ┌─────────────┐│
│   │ access_token││  ← httpOnly, secure, sameSite=lax, 15 min
│   └─────────────┘│
│   ┌─────────────┐│
│   │refresh_token││  ← httpOnly, secure, sameSite=lax, 30 days, path=/api/auth
│   └─────────────┘│
└──────────────────┘
```

### 7.2. Login flow

```
Form submit → Server Action login(email, password)
    ↓
fetch POST /auth/login → {access_token, refresh_token, user}
    ↓
Set cookies (httpOnly, secure)
    ↓
redirect('/profile')
```

### 7.3. Refresh flow

```
User navigates → Server Component fetches data
    ↓
API returns 401 token_expired
    ↓
fetch POST /api/auth/refresh (Route Handler)
    ↓
Route Handler: fetch backend /auth/refresh with refresh_token cookie
    ↓
Получаем новую пару → обновляем cookies → retry исходного запроса
```

### 7.4. Защита от XSS / CSRF

- **XSS:** httpOnly cookies, React escaping, CSP headers в `next.config.js`
- **CSRF:** sameSite=lax cookies, проверка Origin в Server Actions
- **Валидация:** zod на клиенте И на сервере (Server Actions не доверяют клиенту)

### 7.5. Content Security Policy

```javascript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://mc.yandex.ru;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://cdn.dogcare.ru;
  font-src 'self';
  connect-src 'self' https://api.dogcare.ru;
  frame-ancestors 'none';
  form-action 'self' https://yookassa.ru;
`;
```

---

## 8. Формы и валидация

### 8.1. Схемы

Каждая форма имеет zod схему в `src/schemas/`:

```typescript
// src/schemas/auth.ts
export const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

### 8.2. Интеграция с react-hook-form

```typescript
const form = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' },
});

const onSubmit = (data: LoginInput) => { /* Server Action */ };
```

### 8.3. Серверная валидация дублируется

Server Action всегда валидирует input повторно:

```typescript
export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { errors: parsed.error.flatten() };
  // ...
}
```

---

## 9. Стилизация и дизайн

### 9.1. Tailwind config

Design tokens через `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#E67E22', /* ... */ },
        secondary: { DEFAULT: '#34495E', /* ... */ },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui'],
        display: ['Playfair Display', 'serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
};
```

### 9.2. Темизация

Light + Dark через `next-themes`:

```typescript
// app/layout.tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

### 9.3. Responsive

Tailwind breakpoints:
- `sm:` ≥ 640px
- `md:` ≥ 768px
- `lg:` ≥ 1024px
- `xl:` ≥ 1280px

Mobile-first: базовые стили для мобилки, overrides через префиксы.

---

## 10. Деплой

### 10.1. Vercel

Подключение: импорт GitHub репо → автоматические деплои на PR.

**Конфиг:**
- Production branch: `main`
- Preview: все PR
- Build command: `npm run build`
- Install command: `npm install`

### 10.2. Environment variables

Vercel dashboard → Project Settings → Environment Variables:

| Variable | Production | Preview | Development |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | https://api.dogcare.ru/api/v1 | ↑ same | http://localhost:3000/api/v1 |
| `API_INTERNAL_URL` | https://api.dogcare.ru/api/v1 | ↑ same | http://localhost:3000/api/v1 |
| `NEXT_PUBLIC_SITE_URL` | https://dogcare.ru | $VERCEL_URL | http://localhost:3001 |

### 10.3. Preview deployments и CORS

Vercel создаёт preview URLs вида `dogcare-frontend-abc123.vercel.app`. Backend CORS должен разрешать этот паттерн:

```typescript
// Backend, main.ts
app.enableCors({
  origin: [/^https:\/\/dogcare-frontend-.*\.vercel\.app$/, /* ... */],
});
```

---

## 11. Performance

### 11.1. Бюджет

| Метрика | Target |
|---|---|
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 95 |
| Lighthouse Best Practices | ≥ 95 |
| Lighthouse SEO | ≥ 95 |
| LCP | < 2.5s |
| FID / INP | < 100ms / < 200ms |
| CLS | < 0.1 |
| Initial JS bundle (gzip) | < 200 KB |
| Total JS bundle (gzip) | < 500 KB |

### 11.2. Оптимизации

- **next/image** для всех картинок (автоматический lazy loading, WebP, responsive)
- **next/font** для шрифтов (без layout shift)
- **Server Components по умолчанию** (меньше JS)
- **Dynamic imports** для тяжёлых клиентских компонентов
- **Prefetch** на `<Link>` (автоматически)
- **Streaming** через Suspense
- **Image optimization** через Vercel Image Optimization

### 11.3. Monitoring

Vercel Analytics (встроенный) + Web Vitals.

---

## 12. Observability

### 12.1. Логи

Vercel Logs — все `console.*` из Server Components и Route Handlers.

Client-side логирование через Sentry (phase 2).

### 12.2. Error tracking

Sentry SDK (phase 2):

```typescript
// src/app/error.tsx
'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);
  return <ErrorUI onReset={reset} />;
}
```

### 12.3. Analytics

- Vercel Analytics (базовая)
- Яндекс.Метрика (для русского рынка)

---

## 13. Тесты

### 13.1. Стратегия

| Уровень | Инструмент | Что покрываем |
|---|---|---|
| Unit | Vitest | Utils, hooks, schemas |
| Component | React Testing Library | Изолированные компоненты |
| Integration | Vitest + MSW | Страницы с моками API |
| E2E | Playwright | Критические флоу |

### 13.2. Критические E2E сценарии

1. Регистрация → логин → просмотр профиля
2. Анонимный донат от начала до редиректа на payment_url
3. Создание патронажа (exclusive → проверка конфликта)
4. Куратор добавляет собаку → публичный список обновляется
5. Админ верифицирует куратора → email отправлен

### 13.3. MSW для моков

```typescript
// src/mocks/handlers.ts
export const handlers = [
  http.get(`${API_URL}/dogs`, () => HttpResponse.json({ data: [...mockDogs] })),
];
```

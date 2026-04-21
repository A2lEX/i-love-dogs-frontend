# GEMINI.md — DogCare Frontend

> Этот файл является основным руководством для Gemini CLI при работе в данном репозитории. Его инструкции имеют приоритет над стандартным поведением агента.

---

## TL;DR

**DogCare Frontend** — Next.js SSR/SSG приложение (App Router), потребляющее REST API бэкенда.

- **Парный репозиторий:** `dogcare-backend` (NestJS). OpenAPI спека — источник правды для типов.
- **Архитектура:** `docs/ARCHITECTURE.md`
- **Интеграция с API:** `docs/API_INTEGRATION.md`
- **План работ:** `docs/ROADMAP.md`

---

## Стек технологий

| Слой | Технология | Версия |
|---|---|---|
| Framework | Next.js | 14+ (App Router) |
| Language | TypeScript | 5.x (strict) |
| Styling | Tailwind CSS | 3.x |
| UI Components | shadcn/ui | — |
| State (server) | TanStack Query | 5.x |
| State (client) | Zustand | 4.x |
| Forms | react-hook-form + zod | — |
| HTTP client | Native fetch + typed wrapper | — |
| API types | openapi-typescript (codegen) | — |
| Testing | Vitest + React Testing Library | — |
| E2E | Playwright | — |

---

## Основные правила и инварианты (ОБЯЗАТЕЛЬНО К ВЫПОЛНЕНИЮ)

1.  **Типы только из OpenAPI.** Не создавать ручные интерфейсы для API моделей. Использовать `@/types/api`.
2.  **Безопасность токенов.** `access_token` и `refresh_token` хранятся ТОЛЬКО в `httpOnly` cookie. Никакого `localStorage`.
3.  **Server Components по умолчанию.** Использовать `'use client'` только для интерактивности (формы, хуки).
4.  **Валидация через Zod.** Схемы должны соответствовать правилам бэкенда.
5.  **Работа с деньгами.** Хранить в целых числах (минорные единицы). Форматировать через `formatMoney(amount, currency)`.
6.  **Idempotency-Key.** Генерировать на клиенте (`crypto.randomUUID()`) для POST запросов в `/payments` и `/donations`.
7.  **Data Fetching.**
    *   В Server Components: нативный `fetch` с кэшированием Next.js.
    *   В Client Components: только через TanStack Query.
8.  **Server Actions.** Использовать для мутаций везде, где это целесообразно.

---

## Команды

```bash
# Разработка
npm run dev                  # Запуск (порт 3001)
npm run typecheck            # Проверка типов
npm run lint                 # Линтинг
npm run format               # Форматирование (Prettier)

# Генерация типов API (OpenAPI -> TypeScript)
npm run gen:api              # Из продакшн API
npm run gen:api:local        # Из локального бэкенда (localhost:3000)

# Тестирование
npm run test                 # Unit тесты (Vitest)
npm run test:e2e             # E2E тесты (Playwright)
npm run test:cov             # Покрытие тестами

# Сборка
npm run build
npm run start                # Запуск production сборки локально
```

---

## Архитектурные соглашения

### Структура `src/`
- `app/`: Маршруты (App Router). Использовать группировку роутов `(public)`, `(auth)`, `(authenticated)`, `(admin)`.
- `components/ui/`: Компоненты shadcn/ui.
- `components/`: Бизнес-компоненты по доменам (`dogs/`, `payments/`).
- `lib/`: Утилиты и конфигурации (`api-client.ts`, `auth.ts`).
- `hooks/`: Кастомные хуки (в т.ч. обертки над React Query).
- `schemas/`: Zod схемы для валидации форм.
- `types/api.ts`: **АВТОГЕНЕРИРУЕМЫЙ** файл. Не редактировать вручную.

### Именование
- Компоненты: `PascalCase.tsx`
- Хуки: `useCamelCase.ts`
- Утилиты: `camelCase.ts`
- Маршруты: `kebab-case/page.tsx`

---

## Auth Flow
- **Login:** Server Action -> Backend -> Set httpOnly cookies -> Redirect.
- **Refresh:** Middleware перехватывает 401 -> Route Handler `/api/auth/refresh` -> Update cookies -> Retry request.
- **Logout:** Route Handler `/api/auth/logout` -> Backend -> Clear cookies -> Redirect.
- **Access:** Клиентские компоненты используют хук `useAuth()`, который фетчит `/auth/me`.

---

## Чек-лист перед завершением задачи
1.  [ ] Запущен `npm run typecheck` и нет ошибок.
2.  [ ] Запущен `npm run lint` и нет предупреждений.
3.  [ ] Если менялось API — запущен `npm run gen:api`.
4.  [ ] Новые фичи покрыты тестами (Vitest или Playwright).
5.  [ ] Код соответствует соглашениям об именовании.
6.  [ ] Не добавлено лишних зависимостей.

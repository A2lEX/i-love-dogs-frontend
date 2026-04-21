# ROADMAP.md — DogCare Frontend

> Живой документ. Обновляется после каждого закрытого этапа.

**Текущий статус:** ⬜ Этап 1 — Каркас и дизайн-система (не начат)

**Зависимости:** Этапы фронта идут **с отставанием** от бекенда. Нельзя делать интеграцию раньше чем бекенд завершит соответствующий этап.

---

## Легенда

- ⬜ Не начато
- 🟨 В работе
- ✅ Завершено
- ⏸ Заблокировано (ждём бекенд)

---

## Этап 1 — Каркас и дизайн-система

**Длительность:** 1 неделя
**Цель:** проект запускается на Vercel, базовая дизайн-система готова.
**Зависимости от backend:** нет
**Статус:** ⬜

### Задачи

#### 1.1 Инициализация Next.js
- [ ] `npx create-next-app@latest dogcare-frontend --typescript --tailwind --app`
- [ ] Настроить `tsconfig.json` с `strict: true`, `noUncheckedIndexedAccess: true`
- [ ] Настроить алиас `@/` → `src/`
- [ ] ESLint + Prettier конфиг
- [ ] Husky + lint-staged для pre-commit

#### 1.2 Environment и контракт
- [ ] `src/env.mjs` с `@t3-oss/env-nextjs`
- [ ] `.env.example` с документированными переменными
- [ ] README с инструкцией setup

#### 1.3 shadcn/ui setup
- [ ] `npx shadcn-ui@latest init`
- [ ] Установить базовые компоненты: Button, Card, Input, Label, Form, Dialog, Toast, Skeleton
- [ ] Настроить темизацию (light + dark)
- [ ] `next-themes` provider в root layout

#### 1.4 Дизайн-система
- [ ] Tailwind config с дизайн-токенами (цвета, шрифты, spacing)
- [ ] Шрифты через `next/font`
- [ ] `src/lib/cn.ts` utility
- [ ] `src/lib/format.ts` — formatMoney, formatDate
- [ ] Документ `docs/DESIGN_SYSTEM.md` с токенами и примерами

#### 1.5 Базовый layout
- [ ] Root layout с `<html lang="ru">`
- [ ] Header компонент (логотип, навигация, auth buttons)
- [ ] Footer компонент
- [ ] Error boundary (`app/error.tsx`)
- [ ] Not found page (`app/not-found.tsx`)
- [ ] Loading states (`app/loading.tsx`)

#### 1.6 Vercel deploy
- [ ] Подключить репо к Vercel
- [ ] Настроить env переменные на Vercel
- [ ] Preview deployment для PR работает
- [ ] Production domain `dogcare.ru` (если готов)

**Критерии готовности:**
- `npm run dev` запускается локально
- Preview deployment на Vercel для каждого PR
- Базовые компоненты shadcn/ui работают в light/dark темах
- Lighthouse ≥ 90 на главной странице

---

## Этап 2 — Публичный каталог

**Длительность:** 1–2 недели
**Цель:** анонимный пользователь видит собак и может донатить.
**Зависимости от backend:** Этап 2 (Dogs) + Этап 3 (Donations) бекенда
**Статус:** ⏸

### Задачи

#### 2.1 API клиент и типы
- [ ] `npm install openapi-typescript openapi-fetch`
- [ ] Скрипт `gen:api` в package.json
- [ ] Первая генерация `src/types/api.ts`
- [ ] `src/lib/api-client.ts` — клиентский
- [ ] `src/lib/api-client-server.ts` — серверный (с cookies)
- [ ] `src/types/api-helpers.ts` — удобные type helpers

#### 2.2 Главная страница
- [ ] Hero section с описанием миссии
- [ ] Preview нескольких собак (featured dogs)
- [ ] Статистика платформы (собак, патронов, собранных средств)
- [ ] CTA: "Выбрать собаку"

#### 2.3 Каталог собак
- [ ] Страница `/dogs` (Server Component)
- [ ] Компонент `DogCard` с cover photo, именем, прогрессом целей
- [ ] Фильтры: город, порода, наличие exclusive slot, категория цели
- [ ] Пагинация через URL params
- [ ] Loading skeleton
- [ ] Empty state ("Собаки по вашим фильтрам не найдены")
- [ ] SEO: title, description, OG tags

#### 2.4 Профиль собаки
- [ ] Страница `/dogs/[id]` (Server Component)
- [ ] Gallery фото
- [ ] Блок с информацией (возраст, пол, порода, город)
- [ ] Секция "Куратор" с именем передержки
- [ ] Секция "Цели" со списком активных
- [ ] Секция "Новости" (последние 3 отчёта)
- [ ] CTA: "Помочь сейчас" → модалка доната

#### 2.5 Анонимный донат
- [ ] Компонент `AnonymousDonationForm` (Client Component)
- [ ] Поля: сумма (preset + custom), email, display_name (опционально)
- [ ] Zod валидация
- [ ] Сабмит → редирект на YooKassa payment_url
- [ ] Страница `/payment/success` (спасибо)
- [ ] Страница `/payment/failed` (ошибка)

**Критерии готовности:**
- Посетитель без регистрации видит каталог, открывает профиль, делает донат, получает email
- Lighthouse на всех страницах ≥ 90
- Full accessibility audit пройден

---

## Этап 3 — Auth и личный кабинет

**Длительность:** 1 неделя
**Цель:** пользователь регистрируется, логинится, видит свой профиль.
**Зависимости от backend:** Этап 1 (Auth) + Этап 2 бекенда
**Статус:** ⏸

### Задачи

#### 3.1 Auth flow
- [ ] Server Action `register` с cookies
- [ ] Server Action `login` с cookies
- [ ] Route Handler `/api/auth/refresh`
- [ ] Route Handler `/api/auth/logout`
- [ ] Middleware с проверкой auth для защищённых роутов
- [ ] `useAuth()` hook

#### 3.2 Страницы
- [ ] `/login` с формой
- [ ] `/register` с формой
- [ ] `/forgot-password` (если бекенд готов)
- [ ] `/profile` — мой профиль, кнопка logout

#### 3.3 UX детали
- [ ] Redirect на `/login?from=...` при попытке доступа к защищённым
- [ ] Показ уведомлений об ошибках (invalid_credentials и т.д.)
- [ ] Персистентная сессия — refresh автоматический
- [ ] Logout из всех устройств (опционально)

**Критерии готовности:**
- Полный флоу: регистрация → верификация email (если настроено) → логин → профиль → logout
- Защищённые роуты недоступны без auth
- Преждевременный refresh работает без UX-прерываний

---

## Этап 4 — Патронаж

**Длительность:** 1 неделя
**Цель:** пользователь оформляет патронаж (regular / exclusive).
**Зависимости от backend:** Этап 4 (Patronages) бекенда
**Статус:** ⏸

### Задачи

- [ ] Компонент `PatronageForm` с выбором типа
- [ ] Валидация: для exclusive — проверка доступности слота
- [ ] Предупреждение при попытке оформить exclusive: "Это эксклюзивная собака. Вы закроете все её потребности."
- [ ] Сабмит → редирект на YooKassa для подписки
- [ ] Страница `/patronages` — список моих патронажей
- [ ] Страница `/patronages/[id]` — детали патронажа, прогресс по целям собаки
- [ ] Кнопка "Отменить патронаж" с подтверждением
- [ ] Отображение grace period для exclusive

**Критерии готовности:**
- User выбирает собаку → оформляет exclusive → YooKassa subscription создана → ежемесячные списания работают
- При попытке оформить второй exclusive на ту же собаку — понятная ошибка
- Отмена с grace period явно объяснена

---

## Этап 5 — Прогулки

**Длительность:** 1 неделя
**Цель:** пользователь записывается на прогулку.
**Зависимости от backend:** Этап 5 (Walks) бекенда
**Статус:** ⏸

### Задачи

- [ ] Компонент `WalkCalendar` со слотами
- [ ] Форма бронирования: дата, время, duration, notes
- [ ] Валидация: не раньше 24ч вперёд
- [ ] Список моих прогулок `/walks`
- [ ] Статусы: pending, confirmed, started, completed, cancelled
- [ ] Для started → кнопка "Завершить прогулку" + форма отчёта
- [ ] Для completed → просмотр отчёта
- [ ] Календарная навигация (prev/next week)

**Критерии готовности:**
- User бронирует слот → видит подтверждение от куратора → гуляет → пишет отчёт

---

## Этап 6 — Кабинет куратора

**Длительность:** 1–2 недели
**Цель:** верифицированный куратор управляет собаками.
**Зависимости от backend:** Этап 2 + Этап 3 бекенда
**Статус:** ⏸

### Задачи

#### 6.1 Заявка на куратора
- [ ] Страница `/curators/apply`
- [ ] Форма: название передержки, адрес, город, описание, документы
- [ ] После заявки — страница "Заявка на рассмотрении"

#### 6.2 Дашборд
- [ ] `/curator/dashboard` с sidebar навигацией
- [ ] Карточки: моих собак, активных целей, ожидающих прогулок, последних донатов
- [ ] Быстрые действия: "Добавить собаку", "Создать цель", "Написать отчёт"

#### 6.3 Управление собаками
- [ ] `/curator/dogs/new` — форма добавления
- [ ] Загрузка фото через presigned URL
- [ ] `/curator/dogs/[id]/edit` — редактирование
- [ ] Изменение статуса: active, adopted, archived

#### 6.4 Управление целями
- [ ] `/curator/dogs/[id]/goals` — список + форма создания
- [ ] Выбор категории (medical / sterilization / food / custom)
- [ ] Для food — галочка "Ежемесячно"
- [ ] Закрытие / отмена цели

#### 6.5 Отчёты
- [ ] `/curator/dogs/[id]/reports/new` — форма
- [ ] Выбор типа (general / medical / walk / adoption)
- [ ] Multi-photo upload
- [ ] Превью перед публикацией

#### 6.6 Подтверждение прогулок
- [ ] Список ожидающих подтверждения
- [ ] Кнопки "Подтвердить" / "Отклонить"

---

## Этап 7 — Админка

**Длительность:** 1 неделя
**Цель:** админ верифицирует кураторов и управляет платформой.
**Зависимости от backend:** Этап 2 + Этап 7 бекенда
**Статус:** ⏸

### Задачи

- [ ] `/admin/curators` — список с фильтром по verify_status
- [ ] Просмотр заявки куратора с документами
- [ ] Верификация / отклонение с комментарием
- [ ] `/admin/users` — управление юзерами
- [ ] Suspend / activate юзера
- [ ] `/admin/dogs` — все собаки включая archived
- [ ] `/admin/payments` — история всех платежей с фильтрами
- [ ] `/admin/stats` — дашборд со статистикой

---

## Этап 8 — Polish и launch

**Длительность:** 1–2 недели
**Цель:** продакт готов к публичному запуску.
**Статус:** ⏸

### Задачи

#### 8.1 UX polish
- [ ] Все loading states с скелетонами
- [ ] Все error states с понятными сообщениями
- [ ] Toasts для всех успешных действий
- [ ] Анимации и transitions (subtle)
- [ ] Mobile responsive проверка всех страниц

#### 8.2 SEO
- [ ] Metadata для всех статических страниц
- [ ] Dynamic metadata для `/dogs/[id]`
- [ ] `sitemap.xml`
- [ ] `robots.txt`
- [ ] Open Graph tags
- [ ] Structured data (JSON-LD) для собак (Product schema?)

#### 8.3 Analytics
- [ ] Yandex.Metrica
- [ ] Vercel Analytics
- [ ] Конверсионные events: signup, donation, patronage

#### 8.4 Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation везде
- [ ] Screen reader тестирование
- [ ] Контраст ≥ 4.5:1

#### 8.5 Performance
- [ ] Lighthouse ≥ 90 на ВСЕХ страницах
- [ ] Bundle size анализ и оптимизация
- [ ] Image optimization (все через next/image)
- [ ] Font optimization
- [ ] Preconnect / dns-prefetch для CDN и API

#### 8.6 Error tracking
- [ ] Sentry integration
- [ ] Source maps
- [ ] Release tracking

#### 8.7 Тесты
- [ ] Unit: utils, hooks, schemas ≥ 70%
- [ ] Component: критические компоненты
- [ ] E2E (Playwright):
  - [ ] Регистрация и логин
  - [ ] Анонимный донат от начала до success page
  - [ ] Создание патронажа
  - [ ] Куратор добавляет собаку
  - [ ] Админ верифицирует куратора

#### 8.8 Документация
- [ ] README с инструкциями
- [ ] `docs/DESIGN_SYSTEM.md` полный
- [ ] `docs/CONTRIBUTING.md`
- [ ] CHANGELOG.md

---

## Backlog (после MVP)

### Фичи
- Push notifications (web push через Service Worker)
- PWA (installable, offline support базовый)
- Многоязычность (i18n — English)
- Shareable links для собак с красивыми OG preview
- Социальные шары (Telegram, VK, WhatsApp)
- Виджеты для встраивания на сторонние сайты
- Реферальная программа (UI)
- Статистика пользователя (сколько помог)

### Технические
- Storybook для компонентной библиотеки
- Visual regression tests (Percy / Chromatic)
- Bundle analyzer в CI
- Edge runtime где возможно
- React 19 + Server Components streaming
- Partial Prerendering когда стабилизируется

### UX
- Темы оформления (пользовательские)
- Онбординг-тур для новых юзеров
- Персональные рекомендации собак
- Фотоотчёты в формате stories

---

## История релизов

*(Заполняется после каждого deploy в production)*

| Версия | Дата | Изменения |
|---|---|---|
| — | — | — |

# Dog Donations & Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the entire frontend from dark glassmorphism to clean modern white, add dog detail page with donation goals/reports/walks, and integrate with the existing NestJS backend API.

**Architecture:** Full visual overhaul of globals.css + all existing components, then build new pages (`/dogs/[id]`) and components (DonateModal, GoalCard, ReportCard, WalkBooking). Server components for data fetching, client components for interactive forms. All API calls go through the existing axios instance at `src/lib/api.ts`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, CSS Modules, Axios

**Spec:** `docs/superpowers/specs/2026-03-31-dog-donations-redesign-design.md`

---

## File Structure

### Modified files:
- `src/app/globals.css` — new color palette, remove dark theme/glassmorphism
- `src/app/layout.tsx` — update lang to "ru", update metadata
- `src/app/page.tsx` — redesign home page (remove blobs, add dog cards)
- `src/app/page.module.css` — clean modern styles
- `src/app/dogs/page.tsx` — add filters, update design
- `src/app/dogs/DogsPage.module.css` — clean modern styles
- `src/components/layout/Header.tsx` — simplify, update nav links
- `src/components/layout/Header.module.css` — remove backdrop-filter
- `src/components/layout/Footer.tsx` — simplify
- `src/components/layout/Footer.module.css` — clean styles
- `src/components/dogs/DogCard.tsx` — add Link to `/dogs/:id`, remove action buttons, add city field
- `src/components/dogs/DogCard.module.css` — clean modern card styles
- `src/components/ui/Button.module.css` — update to black/white scheme
- `src/components/ui/Input.module.css` — update border colors
- `src/app/auth/auth.module.css` — remove blob, update to white theme
- `src/app/auth/login/page.tsx` — redirect back to previous page instead of dashboard
- `src/app/auth/register/page.tsx` — remove blob style override
- `src/lib/api.ts` — no changes needed

### New files:
- `src/app/dogs/[id]/page.tsx` — dog detail page (server component)
- `src/app/dogs/[id]/DogDetail.module.css` — dog detail styles
- `src/app/dogs/[id]/DogDetailClient.tsx` — client-side interactive parts (walks, donate)
- `src/components/dogs/GoalCard.tsx` — goal card with progress bar
- `src/components/dogs/GoalCard.module.css` — goal card styles
- `src/components/dogs/ReportCard.tsx` — report/update card
- `src/components/dogs/ReportCard.module.css` — report card styles
- `src/components/dogs/WalkBooking.tsx` — walk booking form
- `src/components/dogs/WalkBooking.module.css` — walk booking styles
- `src/components/ui/Modal.tsx` — generic modal component
- `src/components/ui/Modal.module.css` — modal styles
- `src/components/dogs/DonateModal.tsx` — donation form modal
- `src/components/dogs/DonateModal.module.css` — donate modal styles
- `src/components/ui/ProgressBar.tsx` — reusable progress bar
- `src/components/ui/ProgressBar.module.css` — progress bar styles
- `src/components/dogs/DogFilters.tsx` — filters for dogs catalog (client component)
- `src/components/dogs/DogFilters.module.css` — filters styles

---

## Task 1: Redesign global styles and CSS variables

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace globals.css with clean modern palette**

```css
:root {
  /* Clean modern palette */
  --text-primary: #1a1a1a;
  --text-secondary: #666;
  --text-muted: #999;

  --bg-primary: #fff;
  --bg-secondary: #f7f7f7;
  --bg-tertiary: #f0f0f0;

  --accent-base: #1a1a1a;
  --accent-hover: #333;
  --accent-light: rgba(26, 26, 26, 0.08);

  --success: #10b981;
  --error: #ef4444;
  --info: #3b82f6;

  --border: #eee;
  --border-dark: #ddd;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;

  /* Typography */
  --font-family: var(--font-outfit), 'Inter', sans-serif;

  /* Borders & Shadows */
  --radius-sm: 0.375rem;
  --radius-md: 0.75rem;
  --radius-lg: 1.25rem;
  --radius-full: 9999px;

  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03);

  /* Transitions */
  --transition-fast: 0.15s ease-in-out;
  --transition-normal: 0.3s ease-in-out;
  --transition-slow: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  font-family: var(--font-family);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: inherit;
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--text-secondary);
}

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  background: none;
}

input, textarea, select {
  font-family: inherit;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn var(--transition-slow) forwards;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: var(--bg-primary);
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: var(--radius-full);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
```

Key changes: removed `prefers-color-scheme: light` media query (no dark mode), replaced dark palette with clean white/black, removed `--shadow-glow`, added `--border`, `--border-dark`, `--text-muted`, changed `line-height` to `1.7`, added `select` to reset.

- [ ] **Step 2: Verify the app builds**

Run: `cd /Users/aleksandrgirsa/PhpstormProjects/i-love-dogs/frontend && npx next build`
Expected: Build succeeds (visual changes only, no structural breakage)

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "redesign: replace dark glassmorphism palette with clean modern white"
```

---

## Task 2: Redesign Header

**Files:**
- Modify: `src/components/layout/Header.tsx`
- Modify: `src/components/layout/Header.module.css`

- [ ] **Step 1: Update Header.tsx — simplify markup, update text to Russian**

```tsx
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.nav}`}>
        <Link href="/" className={styles.logo}>
          DogCare
        </Link>
        <div className={styles.links}>
          <Link href="/dogs" className={styles.link}>
            Собаки
          </Link>
        </div>
        <div className={styles.authGroup}>
          <Link href="/auth/login" className={styles.btnLogin}>
            Войти
          </Link>
          <Link href="/auth/register" className={styles.btnRegister}>
            Регистрация
          </Link>
        </div>
      </div>
    </header>
  );
}
```

Removed SVG icon, removed "About Us" link (not in scope), text in Russian.

- [ ] **Step 2: Update Header.module.css — remove backdrop-filter, clean styles**

```css
.header {
  position: sticky;
  top: 0;
  width: 100%;
  height: 72px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
  z-index: 100;
  display: flex;
  align-items: center;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.logo {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.logo:hover {
  color: var(--text-primary);
}

.links {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
}

.link {
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.link:hover {
  color: var(--text-primary);
}

.authGroup {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.btnLogin {
  font-weight: 500;
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  font-size: 0.95rem;
}

.btnRegister {
  font-weight: 500;
  background: var(--accent-base);
  color: #fff;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-size: 0.95rem;
}

.btnRegister:hover {
  background: var(--accent-hover);
  color: #fff;
}
```

Removed `@supports (backdrop-filter)` block, removed `--accent-light` glow, simplified to solid white background with thin border.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Header.tsx src/components/layout/Header.module.css
git commit -m "redesign: simplify header, remove blur effects, Russian text"
```

---

## Task 3: Redesign Footer

**Files:**
- Modify: `src/components/layout/Footer.tsx`
- Modify: `src/components/layout/Footer.module.css`

- [ ] **Step 1: Update Footer.tsx — minimal footer**

```tsx
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.content}>
          <span className={styles.brand}>DogCare</span>
          <span className={styles.copy}>&copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
```

Removed multi-column grid, removed links to unimplemented pages, removed emoji.

- [ ] **Step 2: Update Footer.module.css**

```css
.footer {
  border-top: 1px solid var(--border);
  padding: var(--spacing-lg) 0;
  margin-top: auto;
}

.content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-primary);
}

.copy {
  color: var(--text-muted);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .content {
    flex-direction: column;
    gap: var(--spacing-sm);
    text-align: center;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Footer.tsx src/components/layout/Footer.module.css
git commit -m "redesign: simplify footer to minimal brand + copyright"
```

---

## Task 4: Redesign Button and Input components

**Files:**
- Modify: `src/components/ui/Button.module.css`
- Modify: `src/components/ui/Input.module.css`

- [ ] **Step 1: Update Button.module.css — black/white scheme**

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
  font-family: inherit;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary {
  background: var(--accent-base);
  color: #fff;
}

.primary:hover:not(:disabled) {
  background: var(--accent-hover);
}

.secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-dark);
}

.secondary:hover:not(:disabled) {
  border-color: var(--text-primary);
}

.ghost {
  background: transparent;
  color: var(--text-secondary);
}

.ghost:hover:not(:disabled) {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.fullWidth {
  width: 100%;
}
```

Removed translateY hover, removed glow shadow, changed to flat black/white scheme.

- [ ] **Step 2: Update Input.module.css — clean borders**

```css
.wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  width: 100%;
}

.label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-dark);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
  transition: border-color var(--transition-fast);
}

.input:focus {
  outline: none;
  border-color: var(--text-primary);
}

.inputError {
  border-color: var(--error);
}

.inputError:focus {
  border-color: var(--error);
}

.errorText {
  font-size: 0.75rem;
  color: var(--error);
  margin-top: 0.25rem;
}
```

Removed accent glow ring on focus, changed to simple border-color change.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Button.module.css src/components/ui/Input.module.css
git commit -m "redesign: update Button and Input to clean black/white scheme"
```

---

## Task 5: Redesign auth pages

**Files:**
- Modify: `src/app/auth/auth.module.css`
- Modify: `src/app/auth/login/page.tsx`
- Modify: `src/app/auth/register/page.tsx`

- [ ] **Step 1: Update auth.module.css — remove blob, white theme**

```css
.container {
  display: flex;
  min-height: calc(100vh - 72px);
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
}

.card {
  width: 100%;
  max-width: 400px;
}

.header {
  margin-bottom: var(--spacing-xl);
}

.title {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
  color: var(--text-primary);
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.btnSubmit {
  margin-top: var(--spacing-sm);
}

.errorBox {
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(239, 68, 68, 0.08);
  border-left: 3px solid var(--error);
  color: var(--error);
  font-size: 0.875rem;
  border-radius: 4px;
}

.footer {
  margin-top: var(--spacing-xl);
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.link {
  color: var(--text-primary);
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
  color: var(--text-primary);
}
```

Removed `.blob` class, removed `--bg-tertiary` background, removed `box-shadow` and `border` from card, removed `text-align: center` from header.

- [ ] **Step 2: Update login/page.tsx — remove blob div, Russian text, redirect to referrer**

```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import styles from '../auth.module.css';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      const token = data.access_token || data.token;
      login(token, data.user || { id: 'some-id', email, name: 'User', roles: [] });

      const returnTo = searchParams.get('returnTo') || '/dogs';
      router.push(returnTo);
    } catch (err: unknown) {
      if (err !== null && typeof err === 'object' && 'response' in err) {
        const errorResp = err as { response?: { data?: { message?: string } } };
        setError(errorResp.response?.data?.message || 'Неверный email или пароль.');
      } else {
        setError('Неверный email или пароль.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Вход</h1>
          <p className={styles.subtitle}>Войдите, чтобы помогать собакам и записываться на прогулки.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.errorBox}>{error}</div>}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Пароль"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" className={styles.btnSubmit} fullWidth disabled={loading}>
            {loading ? 'Входим...' : 'Войти'}
          </Button>
        </form>

        <div className={styles.footer}>
          Нет аккаунта? <Link href="/auth/register" className={styles.link}>Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  );
}
```

Removed blob div, added `useSearchParams` for `returnTo` redirect, Russian text.

- [ ] **Step 3: Update register/page.tsx — remove blob, Russian text**

```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import styles from '../auth.module.css';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', { email, password, name });
      router.push('/auth/login');
    } catch (err: unknown) {
      if (err !== null && typeof err === 'object' && 'response' in err) {
        const errorResp = err as { response?: { data?: { message?: string } } };
        setError(errorResp.response?.data?.message || 'Не удалось зарегистрироваться.');
      } else {
        setError('Не удалось зарегистрироваться.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Регистрация</h1>
          <p className={styles.subtitle}>Создайте аккаунт, чтобы помогать собакам.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.errorBox}>{error}</div>}

          <Input
            label="Имя"
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Пароль"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" className={styles.btnSubmit} fullWidth disabled={loading}>
            {loading ? 'Создаём...' : 'Создать аккаунт'}
          </Button>
        </form>

        <div className={styles.footer}>
          Уже есть аккаунт? <Link href="/auth/login" className={styles.link}>Войти</Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/auth/auth.module.css src/app/auth/login/page.tsx src/app/auth/register/page.tsx
git commit -m "redesign: clean auth pages, remove blobs, Russian text, returnTo redirect"
```

---

## Task 6: Update layout.tsx metadata

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update metadata and lang**

```tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Providers } from '@/contexts/Providers';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'DogCare',
  description: 'Помогайте собакам из приютов — пожертвования, прогулки, забота.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.variable}>
      <body>
        <Providers>
          <main className="app-container">
            <Header />
            {children}
            <Footer />
          </main>
        </Providers>
      </body>
    </html>
  );
}
```

Changed `lang` to `"ru"`, updated title and description.

- [ ] **Step 2: Commit**

```bash
git add src/app/layout.tsx
git commit -m "redesign: update metadata to Russian, set lang=ru"
```

---

## Task 7: Redesign DogCard + update Dog interface

**Files:**
- Modify: `src/components/dogs/DogCard.tsx`
- Modify: `src/components/dogs/DogCard.module.css`

- [ ] **Step 1: Update DogCard.tsx — add Link, add city, remove action buttons**

```tsx
import React from 'react';
import Link from 'next/link';
import styles from './DogCard.module.css';

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age_months: number;
  gender: 'male' | 'female' | 'unknown';
  description: string;
  city: string;
  cover_photo_url: string | null;
}

interface DogCardProps {
  dog: Dog;
}

function formatAge(months: number): string {
  if (months < 12) {
    return `${months} мес`;
  }
  const years = Math.floor(months / 12);
  const m = months % 12;
  if (m === 0) return `${years} г`;
  return `${years} г ${m} мес`;
}

const DogCard: React.FC<DogCardProps> = ({ dog }) => {
  return (
    <Link href={`/dogs/${dog.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={dog.cover_photo_url || '/placeholder-dog.jpg'}
          alt={dog.name}
          className={styles.image}
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{dog.name}</h3>
        <span className={styles.meta}>
          {[dog.breed, formatAge(dog.age_months), dog.city].filter(Boolean).join(' · ')}
        </span>
      </div>
    </Link>
  );
};

export default DogCard;
```

Added `city` and `'unknown'` gender to Dog interface. Replaced `div` wrapper with `Link`. Removed footer buttons. Combined breed/age/city into single meta line. Removed `'use client'` since no hooks are used. Changed placeholder to local file instead of Unsplash URL.

- [ ] **Step 2: Update DogCard.module.css — clean modern card**

```css
.card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color var(--transition-fast);
  text-decoration: none;
  color: inherit;
}

.card:hover {
  border-color: var(--border-dark);
  color: inherit;
}

.imageWrapper {
  position: relative;
  width: 100%;
  padding-bottom: 75%;
  background: var(--bg-secondary);
  overflow: hidden;
}

.image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content {
  padding: 16px;
}

.name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px;
}

.meta {
  font-size: 0.875rem;
  color: var(--text-secondary);
}
```

Removed glassmorphism, removed hover scale/transform, minimal card with border.

- [ ] **Step 3: Commit**

```bash
git add src/components/dogs/DogCard.tsx src/components/dogs/DogCard.module.css
git commit -m "redesign: clean DogCard with Link, city field, no action buttons"
```

---

## Task 8: Redesign dogs catalog page

**Files:**
- Modify: `src/app/dogs/page.tsx`
- Modify: `src/app/dogs/DogsPage.module.css`

- [ ] **Step 1: Update dogs/page.tsx — Russian text, remove highlight class, update API response handling**

```tsx
import React from 'react';
import DogCard, { Dog } from '@/components/dogs/DogCard';
import styles from './DogsPage.module.css';

export const dynamic = 'force-dynamic';

async function getDogs(): Promise<Dog[]> {
  try {
    const res = await fetch('http://localhost:3000/api/v1/dogs', {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch dogs');
    }

    const data = await res.json();
    return data.data.items;
  } catch (error) {
    console.error('Error fetching dogs:', error);
    return [];
  }
}

export default async function DogsPage() {
  const dogs = await getDogs();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Собаки</h1>
        <p className={styles.subtitle}>
          Каждый из них ждёт помощи. Выберите собаку, узнайте её историю.
        </p>
      </header>

      {dogs.length > 0 ? (
        <div className={styles.grid}>
          {dogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>Пока нет собак. Попробуйте позже.</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Update DogsPage.module.css — clean styles**

```css
.container {
  padding: 48px 24px 80px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 40px;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  max-width: 500px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.empty {
  text-align: center;
  padding: 80px 24px;
  color: var(--text-muted);
}
```

Removed animation, removed centered text, left-aligned header, smaller title.

- [ ] **Step 3: Commit**

```bash
git add src/app/dogs/page.tsx src/app/dogs/DogsPage.module.css
git commit -m "redesign: clean dogs catalog page, Russian text, left-aligned header"
```

---

## Task 9: Redesign home page

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/page.module.css`

- [ ] **Step 1: Update page.tsx — remove blobs, add dog cards section**

```tsx
import Link from 'next/link';
import DogCard, { Dog } from '@/components/dogs/DogCard';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

async function getFeaturedDogs(): Promise<Dog[]> {
  try {
    const res = await fetch('http://localhost:3000/api/v1/dogs?limit=4', {
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data.items;
  } catch {
    return [];
  }
}

export default async function Home() {
  const dogs = await getFeaturedDogs();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Помогите тем, кто не может попросить сам</h1>
        <p className={styles.subtitle}>
          Собаки из приютов ждут вашей помощи. Пожертвуйте на лечение, корм или просто сходите на прогулку.
        </p>
        <div className={styles.ctaGroup}>
          <Link href="/dogs" className={styles.btnPrimary}>
            Смотреть собак
          </Link>
        </div>
      </section>

      {dogs.length > 0 && (
        <section className={styles.featured}>
          <h2 className={styles.sectionTitle}>Им сейчас нужна помощь</h2>
          <div className={styles.grid}>
            {dogs.map((dog) => (
              <DogCard key={dog.id} dog={dog} />
            ))}
          </div>
        </section>
      )}

      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>Как это работает</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <p>Выберите собаку и прочитайте её историю</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <p>Помогите — пожертвуйте на лечение, корм или передержку</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <p>Следите за отчётами и, если хотите, запишитесь на прогулку</p>
          </div>
        </div>
      </section>
    </div>
  );
}
```

Server component fetching featured dogs. Removed blobs, gradient text, "Join Community" button. Added "How it works" section with 3 steps. Warm but honest Russian text.

- [ ] **Step 2: Update page.module.css — clean modern home styles**

```css
.page {
  display: flex;
  flex-direction: column;
}

.hero {
  padding: 80px 24px 64px;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}

.title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  line-height: 1.7;
}

.ctaGroup {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.btnPrimary {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  background: var(--accent-base);
  color: #fff;
  text-decoration: none;
}

.btnPrimary:hover {
  background: var(--accent-hover);
  color: #fff;
}

/* Featured dogs section */
.featured {
  padding: 0 24px 64px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.sectionTitle {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--text-primary);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

/* How it works */
.howItWorks {
  padding: 64px 24px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  border-top: 1px solid var(--border);
}

.steps {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.step {
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.stepNumber {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-muted);
  flex-shrink: 0;
}

.step p {
  font-size: 1.05rem;
  color: var(--text-secondary);
  line-height: 1.7;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx src/app/page.module.css
git commit -m "redesign: clean home page with featured dogs and how-it-works"
```

---

## Task 10: Create ProgressBar component

**Files:**
- Create: `src/components/ui/ProgressBar.tsx`
- Create: `src/components/ui/ProgressBar.module.css`

- [ ] **Step 1: Create ProgressBar.tsx**

```tsx
import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  current: number;
  target: number;
}

export function ProgressBar({ current, target }: ProgressBarProps) {
  const percent = target > 0 ? Math.min((current / target) * 100, 100) : 0;

  return (
    <div className={styles.wrapper}>
      <div className={styles.bar}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
      <div className={styles.labels}>
        <span>{current.toLocaleString('ru-RU')} руб.</span>
        <span>из {target.toLocaleString('ru-RU')} руб.</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ProgressBar.module.css**

```css
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.bar {
  width: 100%;
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: 3px;
  overflow: hidden;
}

.fill {
  height: 100%;
  background: var(--text-primary);
  border-radius: 3px;
  transition: width var(--transition-normal);
}

.labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-muted);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ProgressBar.tsx src/components/ui/ProgressBar.module.css
git commit -m "feat: add ProgressBar component"
```

---

## Task 11: Create Modal component

**Files:**
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/ui/Modal.module.css`

- [ ] **Step 1: Create Modal.tsx**

```tsx
'use client';

import React, { useEffect, useRef } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose} aria-label="Закрыть">
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Modal.module.css**

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: var(--spacing-md);
}

.modal {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: var(--spacing-xl);
  width: 100%;
  max-width: 420px;
  position: relative;
}

.close {
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 1.5rem;
  color: var(--text-muted);
  cursor: pointer;
  background: none;
  border: none;
  line-height: 1;
}

.close:hover {
  color: var(--text-primary);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Modal.tsx src/components/ui/Modal.module.css
git commit -m "feat: add Modal component"
```

---

## Task 12: Create GoalCard component

**Files:**
- Create: `src/components/dogs/GoalCard.tsx`
- Create: `src/components/dogs/GoalCard.module.css`

- [ ] **Step 1: Create GoalCard.tsx**

```tsx
import React from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import styles from './GoalCard.module.css';

export interface Goal {
  id: string;
  dog_id: string;
  category: 'medical' | 'sterilization' | 'food' | 'custom';
  title: string;
  description: string | null;
  amount_target: number;
  amount_collected: number;
  deadline: string | null;
  is_recurring: boolean;
  status: 'active' | 'completed' | 'cancelled';
}

interface GoalCardProps {
  goal: Goal;
  onDonate: (goal: Goal) => void;
}

const categoryLabels: Record<Goal['category'], string> = {
  medical: 'Лечение',
  sterilization: 'Стерилизация',
  food: 'Корм',
  custom: 'Другое',
};

export function GoalCard({ goal, onDonate }: GoalCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.badge}>{categoryLabels[goal.category]}</span>
        {goal.deadline && (
          <span className={styles.deadline}>
            до {new Date(goal.deadline).toLocaleDateString('ru-RU')}
          </span>
        )}
      </div>
      <h3 className={styles.title}>{goal.title}</h3>
      {goal.description && <p className={styles.description}>{goal.description}</p>}
      <ProgressBar current={goal.amount_collected} target={goal.amount_target} />
      <button className={styles.donateBtn} onClick={() => onDonate(goal)}>
        Помочь
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create GoalCard.module.css**

```css
.card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  background: var(--bg-secondary);
  padding: 3px 8px;
  border-radius: 4px;
}

.deadline {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.donateBtn {
  margin-top: 4px;
  padding: 10px;
  background: var(--accent-base);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.donateBtn:hover {
  background: var(--accent-hover);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dogs/GoalCard.tsx src/components/dogs/GoalCard.module.css
git commit -m "feat: add GoalCard component with progress bar and donate button"
```

---

## Task 13: Create ReportCard component

**Files:**
- Create: `src/components/dogs/ReportCard.tsx`
- Create: `src/components/dogs/ReportCard.module.css`

- [ ] **Step 1: Create ReportCard.tsx**

```tsx
import React from 'react';
import styles from './ReportCard.module.css';

export interface Report {
  id: string;
  dog_id: string;
  curator_id: string;
  type: 'general' | 'medical' | 'walk' | 'adoption';
  content: string;
  photo_urls: string[];
  created_at: string;
}

const typeLabels: Record<Report['type'], string> = {
  general: 'Обновление',
  medical: 'Лечение',
  walk: 'Прогулка',
  adoption: 'Усыновление',
};

export function ReportCard({ report }: { report: Report }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.badge}>{typeLabels[report.type]}</span>
        <time className={styles.date}>
          {new Date(report.created_at).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </time>
      </div>
      <p className={styles.content}>{report.content}</p>
      {report.photo_urls.length > 0 && (
        <div className={styles.photos}>
          {report.photo_urls.map((url, i) => (
            <img key={i} src={url} alt="" className={styles.photo} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create ReportCard.module.css**

```css
.card {
  padding: 20px 0;
  border-bottom: 1px solid var(--border);
}

.card:last-child {
  border-bottom: none;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.badge {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
  background: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: 3px;
}

.date {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.content {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
}

.photos {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  overflow-x: auto;
}

.photo {
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dogs/ReportCard.tsx src/components/dogs/ReportCard.module.css
git commit -m "feat: add ReportCard component for curator updates"
```

---

## Task 14: Create DonateModal component

**Files:**
- Create: `src/components/dogs/DonateModal.tsx`
- Create: `src/components/dogs/DonateModal.module.css`

- [ ] **Step 1: Create DonateModal.tsx**

```tsx
'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Goal } from '@/components/dogs/GoalCard';
import styles from './DonateModal.module.css';

interface DonateModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DonateModal({ goal, isOpen, onClose }: DonateModalProps) {
  const { isAuthenticated } = useAuth();
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const numAmount = Number(amount);
    if (!numAmount || numAmount < 10) {
      setError('Минимальная сумма — 10 руб.');
      return;
    }

    setLoading(true);
    try {
      if (isAuthenticated) {
        await api.post('/payments/donate', {
          amount: numAmount,
          goal_id: goal?.id,
        });
      } else {
        if (!email) {
          setError('Укажите email.');
          setLoading(false);
          return;
        }
        await api.post('/payments/donate-anon', {
          amount: numAmount,
          goal_id: goal?.id,
          email,
          display_name: displayName || undefined,
        });
      }
      setSuccess(`Готово. ${numAmount.toLocaleString('ru-RU')} руб. на ${goal?.title || 'помощь'}.`);
      setAmount('');
      setEmail('');
      setDisplayName('');
    } catch (err: unknown) {
      if (err !== null && typeof err === 'object' && 'response' in err) {
        const errorResp = err as { response?: { data?: { message?: string } } };
        setError(errorResp.response?.data?.message || 'Не удалось отправить пожертвование.');
      } else {
        setError('Не удалось отправить пожертвование.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccess('');
    setAmount('');
    onClose();
  };

  if (!goal) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className={styles.content}>
        <h2 className={styles.title}>Помочь</h2>
        <p className={styles.goalName}>{goal.title}</p>

        {success ? (
          <div className={styles.successBox}>{success}</div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorBox}>{error}</div>}

            <Input
              label="Сумма (руб.)"
              type="number"
              min="10"
              placeholder="500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            {!isAuthenticated && (
              <>
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  label="Ваше имя (необязательно)"
                  placeholder="Аноним"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </>
            )}

            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Отправляем...' : 'Пожертвовать'}
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
}
```

- [ ] **Step 2: Create DonateModal.module.css**

```css
.content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.goalName {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0 0 16px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.errorBox {
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(239, 68, 68, 0.08);
  border-left: 3px solid var(--error);
  color: var(--error);
  font-size: 0.875rem;
  border-radius: 4px;
}

.successBox {
  padding: var(--spacing-md);
  background: rgba(16, 185, 129, 0.08);
  border-left: 3px solid var(--success);
  color: var(--success);
  font-size: 0.95rem;
  border-radius: 4px;
  margin-top: 12px;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dogs/DonateModal.tsx src/components/dogs/DonateModal.module.css
git commit -m "feat: add DonateModal with auth and anonymous donation support"
```

---

## Task 15: Create WalkBooking component

**Files:**
- Create: `src/components/dogs/WalkBooking.tsx`
- Create: `src/components/dogs/WalkBooking.module.css`

- [ ] **Step 1: Create WalkBooking.tsx**

```tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import styles from './WalkBooking.module.css';

interface Walk {
  id: string;
  scheduled_at: string;
  duration_min: number;
  status: string;
}

interface WalkBookingProps {
  dogId: string;
  dogName: string;
  upcomingWalks: Walk[];
}

export function WalkBooking({ dogId, dogName, upcomingWalks }: WalkBookingProps) {
  const { isAuthenticated } = useAuth();
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/walks', {
        dog_id: dogId,
        scheduled_at: new Date(date).toISOString(),
        duration_min: Number(duration),
        notes: notes || undefined,
      });
      setSuccess('Прогулка записана! Ждите подтверждения.');
      setDate('');
      setNotes('');
    } catch (err: unknown) {
      if (err !== null && typeof err === 'object' && 'response' in err) {
        const errorResp = err as { response?: { data?: { message?: string } } };
        setError(errorResp.response?.data?.message || 'Не удалось записаться.');
      } else {
        setError('Не удалось записаться.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>Погулять с {dogName}</h2>

      {isAuthenticated ? (
        success ? (
          <div className={styles.successBox}>{success}</div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorBox}>{error}</div>}

            <Input
              label="Дата и время"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />

            <div className={styles.field}>
              <label className={styles.label}>Длительность</label>
              <select
                className={styles.select}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="30">30 минут</option>
                <option value="60">1 час</option>
                <option value="90">1.5 часа</option>
              </select>
            </div>

            <Input
              label="Заметки (необязательно)"
              placeholder="Возьму свой поводок"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <Button type="submit" disabled={loading}>
              {loading ? 'Записываем...' : 'Записаться на прогулку'}
            </Button>
          </form>
        )
      ) : (
        <p className={styles.authHint}>
          <Link href={`/auth/login?returnTo=/dogs/${dogId}`} className={styles.authLink}>
            Войдите
          </Link>
          , чтобы записаться на прогулку.
        </p>
      )}

      {upcomingWalks.length > 0 && (
        <div className={styles.upcoming}>
          <h3 className={styles.upcomingTitle}>Ближайшие прогулки</h3>
          {upcomingWalks.map((walk) => (
            <div key={walk.id} className={styles.walkItem}>
              <span>
                {new Date(walk.scheduled_at).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                })}
                {', '}
                {new Date(walk.scheduled_at).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span className={styles.walkDuration}>{walk.duration_min} мин</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create WalkBooking.module.css**

```css
.section {
  padding-top: 24px;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 20px;
  color: var(--text-primary);
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  max-width: 400px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.select {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-dark);
  border-radius: 8px;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
}

.select:focus {
  outline: none;
  border-color: var(--text-primary);
}

.errorBox {
  padding: var(--spacing-sm) var(--spacing-md);
  background: rgba(239, 68, 68, 0.08);
  border-left: 3px solid var(--error);
  color: var(--error);
  font-size: 0.875rem;
  border-radius: 4px;
}

.successBox {
  padding: var(--spacing-md);
  background: rgba(16, 185, 129, 0.08);
  border-left: 3px solid var(--success);
  color: var(--success);
  font-size: 0.95rem;
  border-radius: 4px;
}

.authHint {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.authLink {
  color: var(--text-primary);
  font-weight: 600;
  text-decoration: underline;
}

.upcoming {
  margin-top: 32px;
}

.upcomingTitle {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--text-primary);
}

.walkItem {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.walkItem:last-child {
  border-bottom: none;
}

.walkDuration {
  color: var(--text-muted);
  font-size: 0.85rem;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dogs/WalkBooking.tsx src/components/dogs/WalkBooking.module.css
git commit -m "feat: add WalkBooking component with auth check and upcoming walks"
```

---

## Task 16: Create dog detail page `/dogs/[id]`

**Files:**
- Create: `src/app/dogs/[id]/page.tsx`
- Create: `src/app/dogs/[id]/DogDetailClient.tsx`
- Create: `src/app/dogs/[id]/DogDetail.module.css`

- [ ] **Step 1: Create page.tsx — server component that fetches all data**

```tsx
import React from 'react';
import Link from 'next/link';
import type { Dog } from '@/components/dogs/DogCard';
import type { Goal } from '@/components/dogs/GoalCard';
import type { Report } from '@/components/dogs/ReportCard';
import { ReportCard } from '@/components/dogs/ReportCard';
import { DogDetailClient } from './DogDetailClient';
import styles from './DogDetail.module.css';

export const dynamic = 'force-dynamic';

interface DogDetail extends Dog {
  status: string;
  curator_id: string;
}

interface Walk {
  id: string;
  scheduled_at: string;
  duration_min: number;
  status: string;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DogDetailPage({ params }: PageProps) {
  const { id } = await params;
  const API = 'http://localhost:3000/api/v1';

  const [dog, goals, reports, walks] = await Promise.all([
    fetchJson<DogDetail>(`${API}/dogs/${id}`),
    fetchJson<Goal[]>(`${API}/goals/dog/${id}`),
    fetchJson<Report[]>(`${API}/reports/dog/${id}`),
    fetchJson<Walk[]>(`${API}/walks/dog/${id}`),
  ]);

  if (!dog) {
    return (
      <div className={styles.notFound}>
        <p>Собака не найдена.</p>
        <Link href="/dogs">Вернуться к списку</Link>
      </div>
    );
  }

  const formatAge = (months: number) => {
    if (months < 12) return `${months} мес`;
    const y = Math.floor(months / 12);
    const m = months % 12;
    if (m === 0) return `${y} г`;
    return `${y} г ${m} мес`;
  };

  const activeGoals = (goals || []).filter((g) => g.status === 'active');
  const sortedReports = (reports || []).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className={styles.page}>
      {/* Breadcrumbs */}
      <nav className={styles.breadcrumbs}>
        <Link href="/dogs" className={styles.breadcrumbLink}>Собаки</Link>
        <span className={styles.breadcrumbSep}>/</span>
        <span>{dog.name}</span>
      </nav>

      {/* Hero */}
      <div className={styles.hero}>
        {dog.cover_photo_url && (
          <img src={dog.cover_photo_url} alt={dog.name} className={styles.heroImage} />
        )}
      </div>

      <div className={styles.content}>
        <h1 className={styles.name}>{dog.name}</h1>
        <p className={styles.meta}>
          {[dog.breed, formatAge(dog.age_months), dog.gender === 'male' ? 'мальчик' : dog.gender === 'female' ? 'девочка' : '', dog.city]
            .filter(Boolean)
            .join(' · ')}
        </p>

        {/* Story */}
        {dog.description && (
          <div className={styles.story}>
            <p>{dog.description}</p>
          </div>
        )}

        {/* Goals + Donate (client interactive) */}
        <DogDetailClient
          dogId={id}
          dogName={dog.name}
          activeGoals={activeGoals}
          upcomingWalks={walks || []}
        />

        {/* Reports */}
        {sortedReports.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Отчёты</h2>
            {sortedReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
```

Note: `params` is awaited as a Promise per Next.js 16 convention.

- [ ] **Step 2: Create DogDetailClient.tsx — client interactive parts**

```tsx
'use client';

import React, { useState } from 'react';
import { GoalCard, type Goal } from '@/components/dogs/GoalCard';
import { DonateModal } from '@/components/dogs/DonateModal';
import { WalkBooking } from '@/components/dogs/WalkBooking';
import styles from './DogDetail.module.css';

interface Walk {
  id: string;
  scheduled_at: string;
  duration_min: number;
  status: string;
}

interface DogDetailClientProps {
  dogId: string;
  dogName: string;
  activeGoals: Goal[];
  upcomingWalks: Walk[];
}

export function DogDetailClient({ dogId, dogName, activeGoals, upcomingWalks }: DogDetailClientProps) {
  const [donateGoal, setDonateGoal] = useState<Goal | null>(null);

  return (
    <>
      {/* Goals */}
      {activeGoals.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Чем помочь</h2>
          <div className={styles.goalsGrid}>
            {activeGoals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} onDonate={setDonateGoal} />
            ))}
          </div>
        </section>
      )}

      {/* Walks */}
      <section className={styles.section}>
        <WalkBooking dogId={dogId} dogName={dogName} upcomingWalks={upcomingWalks} />
      </section>

      {/* Donate Modal */}
      <DonateModal
        goal={donateGoal}
        isOpen={!!donateGoal}
        onClose={() => setDonateGoal(null)}
      />
    </>
  );
}
```

- [ ] **Step 3: Create DogDetail.module.css**

```css
.page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 24px 80px;
}

.breadcrumbs {
  margin-bottom: 24px;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.breadcrumbLink {
  color: var(--text-muted);
}

.breadcrumbLink:hover {
  color: var(--text-primary);
}

.breadcrumbSep {
  margin: 0 8px;
}

.hero {
  margin-bottom: 32px;
}

.heroImage {
  width: 100%;
  max-height: 480px;
  object-fit: cover;
  border-radius: 12px;
}

.content {
  display: flex;
  flex-direction: column;
}

.name {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--text-primary);
}

.meta {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0 0 32px;
}

.story {
  margin-bottom: 40px;
}

.story p {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--text-secondary);
  margin: 0;
}

.section {
  margin-bottom: 48px;
  padding-top: 32px;
  border-top: 1px solid var(--border);
}

.sectionTitle {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 20px;
  color: var(--text-primary);
}

.goalsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.notFound {
  text-align: center;
  padding: 120px 24px;
  color: var(--text-muted);
  font-size: 1.1rem;
}

.notFound a {
  display: inline-block;
  margin-top: 16px;
  color: var(--text-primary);
  text-decoration: underline;
}
```

- [ ] **Step 4: Verify the app builds**

Run: `cd /Users/aleksandrgirsa/PhpstormProjects/i-love-dogs/frontend && npx next build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/app/dogs/\[id\]/
git commit -m "feat: add dog detail page with goals, reports, walks, donations"
```

---

## Task 17: Final verification

- [ ] **Step 1: Run dev server and verify all routes**

Run: `cd /Users/aleksandrgirsa/PhpstormProjects/i-love-dogs/frontend && npx next build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Verify all pages render**

Check these routes manually or via build output:
- `/` — home with featured dogs
- `/dogs` — catalog
- `/dogs/[id]` — detail page
- `/auth/login` — login
- `/auth/register` — register

- [ ] **Step 3: Final commit with all changes if any remain**

```bash
git status
# If any unstaged changes remain:
git add -A
git commit -m "redesign: final cleanup"
```

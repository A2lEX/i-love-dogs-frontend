# Regional Subdomains Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Launch DogCare on `me.*` subdomain showing only Montenegrin dogs, with multilingual (en/sr/ru) and multi-currency (EUR/USD/RUB) support.

**Architecture:** Next.js middleware parses subdomain → sets region cookie. API client reads cookie → appends `?country=ME` to dog queries. Backend filters dogs by city→country mapping stored in a `cities` table. Main domain redirects to `me.*`.

**Tech Stack:** NestJS + Prisma (backend), Next.js App Router + middleware (frontend)

**Spec:** `docs/superpowers/specs/2026-05-04-regional-subdomains-design.md`

---

## File Structure

### Backend (api/)

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `prisma/schema.prisma` (modify) | Add `City` model |
| Create | `src/cities/cities.module.ts` | Cities NestJS module |
| Create | `src/cities/cities.controller.ts` | `GET /cities` endpoint |
| Create | `src/cities/cities.service.ts` | City lookup + country filter logic |
| Modify | `src/dogs/dto/dog-filter.dto.ts` | Add `country` query param |
| Modify | `src/dogs/dogs.service.ts` | Filter dogs by country via cities table |
| Modify | `src/dogs/dogs.module.ts` | Import CitiesModule (if needed for service) |
| Modify | `src/app.module.ts` | Import CitiesModule |
| Modify | `prisma/seed.ts` | Add Montenegro cities + update dogs to use ME cities |

### Frontend (frontend/)

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `src/config/regions.ts` | Region config (languages, currency, defaults) |
| Create | `src/middleware.ts` | Subdomain parsing, region validation, redirects |
| Create | `src/contexts/RegionContext.tsx` | Region + currency context provider |
| Create | `src/app/[lang]/dictionaries/sr.json` | Serbian translations |
| Modify | `src/i18n/config.ts` | Add `sr` locale |
| Modify | `src/app/[lang]/dictionaries.ts` | Add `sr` dictionary import |
| Modify | `src/lib/api.ts` | Add region-aware request interceptor |
| Modify | `src/app/[lang]/page.tsx` | Read region from cookie for API calls |
| Modify | `src/app/[lang]/dogs/page.tsx` | Read region from cookie for API calls |
| Modify | `src/components/layout/Header.tsx` | Currency selector + region-filtered lang switcher |
| Modify | `src/contexts/Providers.tsx` | Wrap with RegionProvider |
| Modify | `src/app/[lang]/layout.tsx` | Use region-aware locale validation |
| Modify | `next.config.ts` | (no changes needed — middleware handles routing) |

---

## Task 1: Backend — City model and migration

**Files:**
- Modify: `api/prisma/schema.prisma`
- New migration will be auto-generated

- [ ] **Step 1: Add City model to Prisma schema**

Add at the end of `api/prisma/schema.prisma`, before the closing of the file:

```prisma
model City {
  id           String   @id @default(uuid()) @db.Uuid
  name         String   @db.VarChar(100)
  country_code String   @db.VarChar(2)
  created_at   DateTime @default(now())

  @@unique([name, country_code])
  @@map("cities")
}
```

- [ ] **Step 2: Generate and apply migration**

Run inside the API container:

```bash
docker exec dogcare-api npx prisma migrate dev --name add_cities_table
```

Expected: Migration created and applied, `cities` table exists.

- [ ] **Step 3: Verify migration**

```bash
docker exec dogcare-postgres psql -U postgres -d dogcare -c "\d cities"
```

Expected: Table with columns `id`, `name`, `country_code`, `created_at`.

- [ ] **Step 4: Commit**

```bash
cd /Users/aleksandrgirsa/PhpstormProjects/i-love-dogs/api
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(db): add cities table for region-based filtering"
```

---

## Task 2: Backend — Seed Montenegro cities + update existing dogs

**Files:**
- Modify: `api/prisma/seed.ts`

- [ ] **Step 1: Add cities seeding to seed.ts**

Add after the `console.log('Seeding data...');` line and before the admin user creation in `api/prisma/seed.ts`:

```typescript
  // Create Montenegro cities
  const meCities = [
    'Podgorica', 'Budva', 'Bar', 'Herceg Novi', 'Kotor',
    'Tivat', 'Nikšić', 'Cetinje', 'Bijelo Polje', 'Ulcinj',
  ];

  for (const cityName of meCities) {
    await prisma.city.upsert({
      where: { name_country_code: { name: cityName, country_code: 'ME' } },
      update: {},
      create: { name: cityName, country_code: 'ME' },
    });
  }
  console.log(`Created ${meCities.length} Montenegro cities`);

  // Also add Moscow for existing data
  await prisma.city.upsert({
    where: { name_country_code: { name: 'Moscow', country_code: 'RU' } },
    update: {},
    create: { name: 'Moscow', country_code: 'RU' },
  });
```

- [ ] **Step 2: Update dog cities to use a Montenegro city**

Change the dog creation city from `'Moscow'` to `'Podgorica'` for all three dogs in `api/prisma/seed.ts`. Replace each `city: 'Moscow',` in the dogs array with `city: 'Podgorica',`.

Also update the curator profile city from `'Moscow'` to `'Podgorica'`.

- [ ] **Step 3: Run the seed**

```bash
docker exec dogcare-api npx prisma db seed
```

Expected: "Created 10 Montenegro cities" + dogs created with city "Podgorica".

- [ ] **Step 4: Verify cities in DB**

```bash
docker exec dogcare-postgres psql -U postgres -d dogcare -c "SELECT name, country_code FROM cities ORDER BY name;"
```

Expected: 10 Montenegro cities with code `ME` + Moscow with `RU`.

- [ ] **Step 5: Commit**

```bash
cd /Users/aleksandrgirsa/PhpstormProjects/i-love-dogs/api
git add prisma/seed.ts
git commit -m "feat(seed): add Montenegro cities and update dogs to Podgorica"
```

---

## Task 3: Backend — Cities module and endpoint

**Files:**
- Create: `api/src/cities/cities.module.ts`
- Create: `api/src/cities/cities.controller.ts`
- Create: `api/src/cities/cities.service.ts`
- Modify: `api/src/app.module.ts`

- [ ] **Step 1: Create cities service**

Create `api/src/cities/cities.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCountry(countryCode: string) {
    return this.prisma.city.findMany({
      where: { country_code: countryCode.toUpperCase() },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, country_code: true },
    });
  }

  async getCityNamesByCountry(countryCode: string): Promise<string[]> {
    const cities = await this.prisma.city.findMany({
      where: { country_code: countryCode.toUpperCase() },
      select: { name: true },
    });
    return cities.map((c) => c.name);
  }
}
```

- [ ] **Step 2: Create cities controller**

Create `api/src/cities/cities.controller.ts`:

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { CitiesService } from './cities.service';

@ApiTags('Cities')
@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get cities, optionally filtered by country code' })
  @ApiQuery({ name: 'country', required: false, example: 'ME' })
  async findAll(@Query('country') country?: string) {
    if (country) {
      return this.citiesService.findByCountry(country);
    }
    return [];
  }
}
```

- [ ] **Step 3: Create cities module**

Create `api/src/cities/cities.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { CitiesController } from './cities.controller';
import { CitiesService } from './cities.service';

@Module({
  controllers: [CitiesController],
  providers: [CitiesService],
  exports: [CitiesService],
})
export class CitiesModule {}
```

- [ ] **Step 4: Register CitiesModule in AppModule**

In `api/src/app.module.ts`, add the import:

```typescript
import { CitiesModule } from './cities/cities.module';
```

Add `CitiesModule` to the `imports` array after `DogsModule`.

- [ ] **Step 5: Verify endpoint works**

Wait for NestJS to recompile, then:

```bash
curl -s http://localhost:3000/api/v1/cities?country=ME | head -200
```

Expected: JSON array of 10 Montenegro cities.

- [ ] **Step 6: Commit**

```bash
cd /Users/aleksandrgirsa/PhpstormProjects/i-love-dogs/api
git add src/cities/
git add src/app.module.ts
git commit -m "feat(cities): add cities module with GET /cities endpoint"
```

---

## Task 4: Backend — Country filter on dogs endpoint

**Files:**
- Modify: `api/src/dogs/dto/dog-filter.dto.ts`
- Modify: `api/src/dogs/dogs.service.ts`
- Modify: `api/src/dogs/dogs.module.ts`

- [ ] **Step 1: Add `country` to DogFilterDto**

In `api/src/dogs/dto/dog-filter.dto.ts`, add after the `breed` field:

```typescript
  @ApiPropertyOptional({ example: 'ME', description: 'ISO 3166-1 alpha-2 country code' })
  @IsOptional()
  @IsString()
  country?: string;
```

- [ ] **Step 2: Import CitiesModule in DogsModule**

In `api/src/dogs/dogs.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { DogsController } from './dogs.controller';
import { DogsService } from './dogs.service';
import { CitiesModule } from '../cities/cities.module';

@Module({
  imports: [CitiesModule],
  controllers: [DogsController],
  providers: [DogsService],
})
export class DogsModule {}
```

- [ ] **Step 3: Inject CitiesService into DogsService and add country filter**

In `api/src/dogs/dogs.service.ts`, update the constructor and `findAll` method:

Add import at top:
```typescript
import { CitiesService } from '../cities/cities.service';
```

Update constructor:
```typescript
constructor(
  private readonly prisma: PrismaService,
  private readonly citiesService: CitiesService,
) {}
```

In the `findAll` method, add after the breed filter check (after `if (filter.breed) ...`):

```typescript
    if (filter.country) {
      const cityNames = await this.citiesService.getCityNamesByCountry(filter.country);
      if (cityNames.length > 0) {
        where.city = { in: cityNames };
      } else {
        // No cities for this country — return empty result
        return { items: [], total: 0, limit, offset };
      }
    }
```

Note: if both `filter.city` and `filter.country` are provided, `country` takes precedence (the `where.city` assignment for country will overwrite the city filter). This is acceptable — filtering by city within a country is an edge case we don't need to support now.

- [ ] **Step 4: Verify country filter works**

Wait for recompile, then test:

```bash
# Should return dogs in ME cities
curl -s http://localhost:3000/api/v1/dogs?country=ME

# Should return empty (no dogs in RU cities after seed update)
curl -s http://localhost:3000/api/v1/dogs?country=RU

# Without country — all dogs (existing behavior)
curl -s http://localhost:3000/api/v1/dogs
```

- [ ] **Step 5: Commit**

```bash
cd /Users/aleksandrgirsa/PhpstormProjects/i-love-dogs/api
git add src/dogs/
git add src/cities/
git commit -m "feat(dogs): add country filter to GET /dogs endpoint"
```

---

## Task 5: Frontend — Region config

**Files:**
- Create: `frontend/src/config/regions.ts`

- [ ] **Step 1: Create region config**

Create `frontend/src/config/regions.ts`:

```typescript
export type RegionConfig = {
  name: string;
  domain: string;
  languages: readonly string[];
  defaultLanguage: string;
  currency: string;
  currencyOptions: readonly string[];
};

export const regions: Record<string, RegionConfig> = {
  me: {
    name: 'Montenegro',
    domain: 'me',
    languages: ['en', 'sr', 'ru'],
    defaultLanguage: 'en',
    currency: 'EUR',
    currencyOptions: ['EUR', 'USD', 'RUB'],
  },
} as const;

export const defaultRegion = 'me';

export function getRegionBySubdomain(subdomain: string): RegionConfig | undefined {
  return regions[subdomain];
}

export function getRegionCountryCode(regionKey: string): string {
  return regionKey.toUpperCase();
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/aleksandrgirsa/PhpstormProjects/i-love-dogs/frontend
git add src/config/regions.ts
git commit -m "feat: add region config for Montenegro subdomain"
```

---

## Task 6: Frontend — i18n — Add Serbian locale

**Files:**
- Modify: `frontend/src/i18n/config.ts`
- Create: `frontend/src/app/[lang]/dictionaries/sr.json`
- Modify: `frontend/src/app/[lang]/dictionaries.ts`

- [ ] **Step 1: Add `sr` to locale config**

In `frontend/src/i18n/config.ts`, change:

```typescript
export const locales = ['en', 'ru', 'pl', 'sr'] as const;
```

- [ ] **Step 2: Create Serbian dictionary**

Create `frontend/src/app/[lang]/dictionaries/sr.json`:

```json
{
  "meta": {
    "title": "DogCare",
    "description": "Pomozite psima iz skloništa — donacije, šetnje, briga."
  },
  "nav": {
    "dogs": "Psi",
    "login": "Prijava",
    "register": "Registracija"
  },
  "home": {
    "hero_title": "Pomozite onima koji ne mogu da traže sami",
    "hero_subtitle": "Psi iz skloništa trebaju vašu pomoć. Donirajte za liječenje, hranu, ili ih izvedite u šetnju.",
    "cta": "Pogledaj pse",
    "featured_title": "Potrebna im je pomoć sada",
    "how_title": "Kako funkcioniše",
    "step1": "Izaberite psa i pročitajte njegovu priču",
    "step2": "Pomozite — donirajte za liječenje, hranu ili smještaj",
    "step3": "Pratite izvještaje i prijavite se za šetnju"
  },
  "dogs": {
    "title": "Psi",
    "subtitle": "Svaki čeka pomoć. Izaberite psa, saznajte njegovu priču.",
    "empty": "Još nema pasa. Provjerite ponovo kasnije.",
    "age_months": "mj",
    "age_years": "g",
    "photo_placeholder": "Fotografija uskoro"
  },
  "auth": {
    "login_title": "Prijava",
    "login_subtitle": "Prijavite se da pomognete psima i prijavite se za šetnje.",
    "login_button": "Prijavi se",
    "login_loading": "Prijavljivanje...",
    "login_error": "Pogrešan email ili lozinka.",
    "register_title": "Registracija",
    "register_subtitle": "Napravite nalog da pomognete psima.",
    "register_button": "Napravi nalog",
    "register_loading": "Kreiranje...",
    "register_error": "Registracija nije uspjela.",
    "no_account": "Nemate nalog?",
    "has_account": "Već imate nalog?",
    "link_register": "Registrujte se",
    "link_login": "Prijavite se",
    "label_name": "Ime",
    "label_email": "Email",
    "label_password": "Lozinka",
    "placeholder_name": "Vaše ime",
    "placeholder_email": "vi@example.com",
    "placeholder_password": "********"
  },
  "modal": {
    "close": "Zatvori"
  },
  "profile": {
    "title": "Profil",
    "logout": "Odjava",
    "email": "Email",
    "name": "Ime",
    "role": "Uloga",
    "status": "Status",
    "created_at": "Registrovan",
    "no_user": "Korisnik nije pronađen"
  },
  "dogPage": {
    "back": "Svi psi",
    "gender_male": "Mužjak",
    "gender_female": "Ženka",
    "gender_unknown": "Nepoznato",
    "curator": "Sklonište:",
    "goals_title": "Kako možete pomoći",
    "goal_medical": "Liječenje",
    "goal_food": "Hrana",
    "goal_shelter": "Smještaj",
    "goal_other": "Ostalo",
    "recurring": "Mjesečno"
  },
  "progress": {
    "of": "od",
    "currency": "EUR"
  }
}
```

- [ ] **Step 3: Add `sr` dictionary import**

In `frontend/src/app/[lang]/dictionaries.ts`, add to the `dictionaries` object:

```typescript
  sr: () => import('./dictionaries/sr.json').then((module) => module.default),
```

- [ ] **Step 4: Verify `sr` locale loads**

Visit `http://me.localhost:3001/sr` (or `http://localhost:3001/sr` for now) — should render Serbian text.

- [ ] **Step 5: Commit**

```bash
cd /Users/aleksandrgirsa/PhpstormProjects/i-love-dogs/frontend
git add src/i18n/config.ts src/app/\[lang\]/dictionaries.ts src/app/\[lang\]/dictionaries/sr.json
git commit -m "feat(i18n): add Serbian (sr) locale"
```

---

## Task 7: Frontend — Next.js middleware for subdomain routing

**Files:**
- Create: `frontend/src/middleware.ts`

- [ ] **Step 1: Create middleware**

Create `frontend/src/middleware.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { regions, defaultRegion } from '@/config/regions';

function getSubdomain(hostname: string): string | null {
  // me.localhost → "me"
  // me.dogcare.ru → "me"
  // localhost → null
  // dogcare.ru → null
  const parts = hostname.split('.');

  // localhost or me.localhost
  if (hostname.includes('localhost')) {
    return parts.length >= 2 ? parts[0] : null;
  }

  // me.dogcare.ru (3 parts) vs dogcare.ru (2 parts)
  if (parts.length >= 3) {
    return parts[0];
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Skip static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files like .css, .js, .ico
  ) {
    return NextResponse.next();
  }

  const subdomain = getSubdomain(hostname);

  // No subdomain → redirect to default region subdomain
  if (!subdomain) {
    const defaultConfig = regions[defaultRegion];
    const protocol = request.nextUrl.protocol;
    // Preserve port for localhost
    const port = request.nextUrl.port ? `:${request.nextUrl.port}` : '';
    const baseDomain = hostname.includes('localhost') ? 'localhost' : hostname;
    const redirectUrl = `${protocol}//${defaultRegion}.${baseDomain}${port}${pathname || '/'}${request.nextUrl.search}`;
    return NextResponse.redirect(new URL(redirectUrl));
  }

  // Invalid subdomain → 404
  const regionConfig = regions[subdomain];
  if (!regionConfig) {
    return NextResponse.rewrite(new URL('/not-found', request.url));
  }

  // Check if path starts with a locale segment
  const pathSegments = pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];

  // Root of subdomain → redirect to default language
  if (!firstSegment) {
    const redirectUrl = new URL(`/${regionConfig.defaultLanguage}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Check if first segment is a language
  const isLanguageSegment = regionConfig.languages.includes(firstSegment);

  if (!isLanguageSegment) {
    // If it looks like a locale code (2 chars) but not supported → 404
    if (firstSegment.length === 2) {
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }
    // Otherwise redirect with default language prepended
    const redirectUrl = new URL(`/${regionConfig.defaultLanguage}${pathname}`, request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Language not supported by this region → 404
  if (!regionConfig.languages.includes(firstSegment)) {
    return NextResponse.rewrite(new URL('/not-found', request.url));
  }

  // All good — set region cookie and continue
  const response = NextResponse.next();
  response.cookies.set('x-region', subdomain, { path: '/' });
  response.cookies.set('x-country', subdomain.toUpperCase(), { path: '/' });

  // Set default currency if not already set
  const existingCurrency = request.cookies.get('preferred_currency');
  if (!existingCurrency) {
    response.cookies.set('preferred_currency', regionConfig.currency, { path: '/' });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
```

- [ ] **Step 2: Verify middleware works**

Visit `http://me.localhost:3001/` — should redirect to `http://me.localhost:3001/en`.
Visit `http://me.localhost:3001/en` — should render homepage.
Visit `http://me.localhost:3001/de` — should show 404.
Visit `http://localhost:3001/` — should redirect to `http://me.localhost:3001/`.

- [ ] **Step 3: Commit**

```bash
cd /Users/aleksandrgirsa/PhpstormProjects/i-love-dogs/frontend
git add src/middleware.ts
git commit -m "feat: add subdomain routing middleware for regional support"
```

---

## Task 8: Frontend — Region context provider

**Files:**
- Create: `frontend/src/contexts/RegionContext.tsx`
- Modify: `frontend/src/contexts/Providers.tsx`

- [ ] **Step 1: Create RegionContext**

Create `frontend/src/contexts/RegionContext.tsx`:

```typescript
'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { regions, defaultRegion } from '@/config/regions';
import type { RegionConfig } from '@/config/regions';

type RegionContextType = {
  region: string;
  regionConfig: RegionConfig;
  currency: string;
  setCurrency: (currency: string) => void;
  countryCode: string;
};

const RegionContext = createContext<RegionContextType | null>(null);

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function setDocCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const regionKey = getCookie('x-region') || defaultRegion;
  const regionConfig = regions[regionKey] || regions[defaultRegion];
  const countryCode = regionKey.toUpperCase();

  const [currency, setCurrencyState] = useState<string>(
    () => getCookie('preferred_currency') || regionConfig.currency,
  );

  const setCurrency = useCallback(
    (newCurrency: string) => {
      if (regionConfig.currencyOptions.includes(newCurrency)) {
        setCurrencyState(newCurrency);
        setDocCookie('preferred_currency', newCurrency);
      }
    },
    [regionConfig.currencyOptions],
  );

  return (
    <RegionContext.Provider
      value={{ region: regionKey, regionConfig, currency, setCurrency, countryCode }}
    >
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegion must be used within RegionProvider');
  return ctx;
}
```

- [ ] **Step 2: Add RegionProvider to Providers**

In `frontend/src/contexts/Providers.tsx`:

```typescript
'use client';

import React from 'react';
import { AuthProvider } from './AuthContext';
import { RegionProvider } from './RegionContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RegionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </RegionProvider>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/aleksandrgirsa/PhpstormProjects/i-love-dogs/frontend
git add src/contexts/RegionContext.tsx src/contexts/Providers.tsx
git commit -m "feat: add RegionContext with currency support"
```

---

## Task 9: Frontend — Region-aware API client

**Files:**
- Modify: `frontend/src/lib/api.ts`

- [ ] **Step 1: Add region interceptor to API client**

In `frontend/src/lib/api.ts`, add a new request interceptor after the existing auth interceptor (before the response interceptor). This interceptor reads the `x-country` cookie and appends it to dog-related requests:

```typescript
// Request interceptor to attach region/country filter
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )x-country=([^;]*)/);
      const country = match ? decodeURIComponent(match[1]) : null;
      if (country && config.url) {
        // Add country param to dog-related endpoints
        if (config.url.includes('/dogs')) {
          config.params = { ...config.params, country };
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);
```

- [ ] **Step 2: Commit**

```bash
cd /Users/aleksandrgirsa/PhpstormProjects/i-love-dogs/frontend
git add src/lib/api.ts
git commit -m "feat: add region-aware interceptor to API client"
```

---

## Task 10: Frontend — Update Server Components to use region cookie

**Files:**
- Modify: `frontend/src/app/[lang]/page.tsx`
- Modify: `frontend/src/app/[lang]/dogs/page.tsx`

- [ ] **Step 1: Update `getFeaturedDogs` in homepage**

In `frontend/src/app/[lang]/page.tsx`, update the `getFeaturedDogs` function to read the country from cookies and pass it to the API:

Replace the existing `getFeaturedDogs` function with:

```typescript
import { cookies } from 'next/headers';

async function getFeaturedDogs(): Promise<Dog[]> {
  try {
    const cookieStore = await cookies();
    const country = cookieStore.get('x-country')?.value || 'ME';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
    const res = await fetch(`${apiUrl}/dogs?limit=4&country=${country}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data.items;
  } catch {
    return [];
  }
}
```

Remove the existing hardcoded `http://localhost:3001` URL.

- [ ] **Step 2: Update `getDogs` in dogs page**

In `frontend/src/app/[lang]/dogs/page.tsx`, update the `getDogs` function:

Replace the existing `getDogs` function with:

```typescript
import { cookies } from 'next/headers';

async function getDogs(): Promise<Dog[]> {
  try {
    const cookieStore = await cookies();
    const country = cookieStore.get('x-country')?.value || 'ME';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
    const res = await fetch(`${apiUrl}/dogs?country=${country}`, {
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
```

- [ ] **Step 3: Verify dogs page shows only regional dogs**

Visit `http://me.localhost:3001/en/dogs` — should show only dogs from Montenegro cities.

- [ ] **Step 4: Commit**

```bash
cd /Users/aleksandrgirsa/PhpstormProjects/i-love-dogs/frontend
git add src/app/\[lang\]/page.tsx src/app/\[lang\]/dogs/page.tsx
git commit -m "feat: filter dogs by region in server components"
```

---

## Task 11: Frontend — Region-aware Header (lang switcher + currency selector)

**Files:**
- Modify: `frontend/src/components/layout/Header.tsx`

- [ ] **Step 1: Update Header to use region-filtered languages and add currency selector**

Replace `frontend/src/components/layout/Header.tsx`:

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDictionary } from '@/contexts/DictionaryContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRegion } from '@/contexts/RegionContext';
import type { Locale } from '@/i18n/config';
import styles from './Header.module.css';

export default function Header() {
  const { dict, lang } = useDictionary();
  const { user, isAuthenticated, logout } = useAuth();
  const { regionConfig, currency, setCurrency } = useRegion();
  const pathname = usePathname();

  const switchLocale = (newLang: string) => {
    const segments = pathname.split('/');
    segments[1] = newLang;
    return segments.join('/');
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.nav}`}>
        <Link href={`/${lang}`} className={styles.logo}>
          <img src="/logo.svg" alt="DogCare" width={140} height={32} />
        </Link>
        <div className={styles.links}>
          <Link href={`/${lang}/dogs`} className={styles.link}>
            {dict.nav.dogs}
          </Link>
        </div>
        <div className={styles.authGroup}>
          <div className={styles.langSwitcher}>
            {regionConfig.languages.map((loc) => (
              <Link
                key={loc}
                href={switchLocale(loc)}
                className={`${styles.langBtn} ${loc === lang ? styles.langActive : ''}`}
              >
                {loc.toUpperCase()}
              </Link>
            ))}
          </div>

          <select
            className={styles.currencySelect}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {regionConfig.currencyOptions.map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </select>
          
          {isAuthenticated && user ? (
            <div className={styles.userInfo}>
              <Link href={`/${lang}/profile`} className={styles.userName}>
                {user.email}
              </Link>
              <button onClick={logout} className={styles.btnLogout}>
                {dict.profile?.logout || 'Logout'}
              </button>
            </div>
          ) : (
            <>
              <Link href={`/${lang}/auth/login`} className={styles.btnLogin}>
                {dict.nav.login}
              </Link>
              <Link href={`/${lang}/auth/register`} className={styles.btnRegister}>
                {dict.nav.register}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Add minimal currency selector styles**

In `frontend/src/components/layout/Header.module.css`, add:

```css
.currencySelect {
  background: transparent;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.85rem;
  cursor: pointer;
  color: inherit;
}
```

- [ ] **Step 3: Verify**

Visit `http://me.localhost:3001/en` — Header should show EN / SR / RU language switcher (not PL) and a currency dropdown with EUR / USD / RUB.

- [ ] **Step 4: Commit**

```bash
cd /Users/aleksandrgirsa/PhpstormProjects/i-love-dogs/frontend
git add src/components/layout/Header.tsx src/components/layout/Header.module.css
git commit -m "feat: region-aware lang switcher and currency selector in Header"
```

---

## Task 12: Frontend — Update layout to validate language against region

**Files:**
- Modify: `frontend/src/app/[lang]/layout.tsx`

- [ ] **Step 1: Update layout to check language against region**

In `frontend/src/app/[lang]/layout.tsx`, update the imports and locale validation:

Add import at top:
```typescript
import { cookies } from 'next/headers';
import { regions, defaultRegion } from '@/config/regions';
```

Update the `generateStaticParams` function to include `sr`:
```typescript
export async function generateStaticParams() {
  // Generate params for all possible locales across all regions
  const allLocales = new Set<string>();
  for (const region of Object.values(regions)) {
    for (const lang of region.languages) {
      allLocales.add(lang);
    }
  }
  return Array.from(allLocales).map((lang) => ({ lang }));
}
```

In the `LangLayout` function, replace `if (!hasLocale(lang)) notFound();` with:

```typescript
  if (!hasLocale(lang)) notFound();

  // Additionally check if the language is supported by the current region
  const cookieStore = await cookies();
  const regionKey = cookieStore.get('x-region')?.value || defaultRegion;
  const regionConfig = regions[regionKey];
  if (regionConfig && !regionConfig.languages.includes(lang)) {
    notFound();
  }
```

- [ ] **Step 2: Verify**

Visit `http://me.localhost:3001/pl` — should 404 (Polish not in ME region).
Visit `http://me.localhost:3001/sr` — should render Serbian content.

- [ ] **Step 3: Commit**

```bash
cd /Users/aleksandrgirsa/PhpstormProjects/i-love-dogs/frontend
git add src/app/\[lang\]/layout.tsx
git commit -m "feat: validate language against current region in layout"
```

---

## Task 13: End-to-end verification

- [ ] **Step 1: Reset database and re-seed with Montenegro data**

```bash
docker exec dogcare-api npx prisma migrate reset --force
```

This will re-run all migrations and the seed. Expected: cities table populated, dogs in Podgorica.

- [ ] **Step 2: Verify full flow**

1. `http://localhost:3001/` → redirects to `http://me.localhost:3001/en`
2. `http://me.localhost:3001/en` → homepage with dogs from Montenegro
3. `http://me.localhost:3001/en/dogs` → catalog with only ME dogs
4. `http://me.localhost:3001/sr` → Serbian homepage
5. `http://me.localhost:3001/ru` → Russian homepage
6. `http://me.localhost:3001/pl` → 404
7. Language switcher shows EN / SR / RU (no PL)
8. Currency selector shows EUR / USD / RUB
9. `curl http://localhost:3000/api/v1/dogs?country=ME` → returns dogs
10. `curl http://localhost:3000/api/v1/cities?country=ME` → returns 10 cities

- [ ] **Step 3: Final commit**

```bash
cd /Users/aleksandrgirsa/PhpstormProjects/i-love-dogs/frontend
git add -A
git commit -m "feat: regional subdomains — Montenegro launch complete"
```

# Regional Subdomains — Design Spec

**Date:** 2026-05-04
**Status:** Approved
**Scope:** me.* subdomain for Montenegro, with foundation for future regions

---

## Summary

Launch DogCare in Montenegro via regional subdomain `me.dogcare.ru`. Dogs are filtered by region using a city→country mapping stored in the database. The main domain redirects to `me.*`. Full multilingual support (en, sr, ru) and multi-currency (EUR default + USD, RUB options).

---

## Architecture

```
Request → me.dogcare.ru/en/dogs
         ↓
   Next.js Middleware
   - parse subdomain → region = "me"
   - validate region exists in config
   - no subdomain → redirect to me.*
   - set x-region cookie
         ↓
   Server Component / API calls
   - read region from cookie
   - add ?country=ME to backend requests
         ↓
   NestJS API
   - receive country=ME
   - filter: WHERE city IN (SELECT name FROM cities WHERE country_code = 'ME')
```

---

## Backend Changes

### New table: `cities`

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

### Seed data (Montenegro)

Cities: Podgorica, Budva, Bar, Herceg Novi, Kotor, Tivat, Nikšić, Cetinje, Bijelo Polje, Ulcinj

### API changes

- `GET /api/v1/dogs` — new optional query param `country` (ISO 3166-1 alpha-2). When provided, filters dogs where `city IN (SELECT name FROM cities WHERE country_code = :country)`.
- `GET /api/v1/cities?country=ME` — new endpoint returning list of cities for a country. Used by curator form for city selection.

---

## Frontend Changes

### Region config (`src/config/regions.ts`)

```typescript
export const regions = {
  me: {
    name: "Montenegro",
    languages: ["en", "sr", "ru"],
    defaultLanguage: "en",
    currency: "EUR",
    currencyOptions: ["EUR", "USD", "RUB"],
  }
} as const;
```

### Middleware (`src/middleware.ts`)

Order of checks:
1. No subdomain → redirect to `me.<domain>` (preserving path)
2. Subdomain present → validate against region config → if invalid → 404
3. No `[lang]` in path → redirect to `/<defaultLanguage>/`
4. `[lang]` not supported by region �� 404
5. All ok → pass through, set `x-region` cookie

### API client

- Reads current region from cookie
- Automatically appends `?country=ME` to all dog-related API requests

### i18n

- Existing `[lang]` routing remains
- Add `sr` (Serbian) dictionary
- Middleware validates language is supported by current region

### Currency

- Stored in cookie `preferred_currency`
- Default from region config (EUR for ME)
- UI: currency selector in header

### Dev mode

- Use `me.localhost:3001` (Next.js supports subdomain routing on localhost)
- Fallback: cookie `x-region-override` for environments where subdomains don't work

---

## URL Routing

```
me.dogcare.ru/              → redirect to me.dogcare.ru/en/
me.dogcare.ru/en/           → homepage (ME dogs only)
me.dogcare.ru/en/dogs       → catalog (ME dogs only)
me.dogcare.ru/sr/dogs       → catalog in Serbian
me.dogcare.ru/ru/dogs       → catalog in Russian
me.dogcare.ru/de/dogs       → 404 (de not in ME languages)
dogcare.ru/                 → redirect to me.dogcare.ru/en/
dogcare.ru/en/dogs          → redirect to me.dogcare.ru/en/dogs
```

---

## Error Handling & Edge Cases

- **Curator adds dog with city not in `cities` table** — allowed. Dog simply won't appear in any regional catalog until city is added to the table by admin.
- **City exists in multiple countries** — unique constraint is `(name, country_code)`, so "Bar, ME" and "Bar, UA" are separate entries. Filter works by `country_code`.
- **Region with no dogs** — show empty state "No dogs in this region yet"
- **Invalid currency in cookie** — fallback to region default
- **Invalid subdomain** — 404 page

---

## Out of Scope

- Additional regions beyond ME (future work)
- Payment integration with regional payment providers
- Regional admin panels
- Geo-IP based auto-detection of region

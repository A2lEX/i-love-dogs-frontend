import 'server-only';

import type { Locale } from '@/i18n/config';
export type { Locale };
export { locales, defaultLocale, hasLocale } from '@/i18n/config';

const dictionaries: Record<Locale, () => Promise<Record<string, Record<string, string>>>> = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  ru: () => import('./dictionaries/ru.json').then((module) => module.default),
  pl: () => import('./dictionaries/pl.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => dictionaries[locale]();

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;

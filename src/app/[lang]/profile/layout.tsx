import { getDictionary, hasLocale } from '../dictionaries';
import type { Locale } from '../dictionaries';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang as Locale);
  return {
    title: dict.profile.title,
    robots: { index: false, follow: false },
  } satisfies Metadata;
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import { getDictionary, hasLocale } from '../../dictionaries';
import type { Locale } from '../../dictionaries';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang as Locale);
  return {
    title: dict.auth.register_title,
    description: dict.auth.register_subtitle,
  };
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}

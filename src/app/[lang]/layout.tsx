import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import '../globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Providers } from '@/contexts/Providers';
import { DictionaryProvider } from '@/contexts/DictionaryContext';
import { getDictionary, hasLocale, locales } from './dictionaries';
import type { Locale } from './dictionaries';
import { cookies } from 'next/headers';
import { regions, defaultRegion } from '@/config/regions';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-outfit',
  display: 'swap',
});

export async function generateStaticParams() {
  const allLocales = new Set<string>();
  for (const region of Object.values(regions)) {
    for (const lang of region.languages) {
      allLocales.add(lang);
    }
  }
  return Array.from(allLocales).map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang as Locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!hasLocale(lang)) notFound();

  // Check if language is supported by the current region
  const cookieStore = await cookies();
  const regionKey = cookieStore.get('x-region')?.value || defaultRegion;
  const regionConfig = regions[regionKey];
  if (regionConfig && !regionConfig.languages.includes(lang)) {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);

  return (
    <html lang={lang} className={inter.variable}>
      <body>
        <DictionaryProvider dict={dict} lang={lang as Locale}>
          <Providers>
            <main className="app-container">
              <Header />
              {children}
              <Footer />
            </main>
          </Providers>
        </DictionaryProvider>
      </body>
    </html>
  );
}

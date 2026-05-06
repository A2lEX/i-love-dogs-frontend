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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tailo.org';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang as Locale);

  const title = `${dict.meta.title} — ${dict.meta.description}`;
  const description = dict.meta.description;
  const url = `${SITE_URL}/${lang}`;

  return {
    title: {
      default: title,
      template: `%s | ${dict.meta.title}`,
    },
    description,
    metadataBase: new URL(SITE_URL),
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        locales.map((l) => [l, `${SITE_URL}/${l}`])
      ),
    },
    icons: {
      icon: '/favicon.svg',
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Tailo',
      locale: lang,
      type: 'website',
      images: [
        {
          url: `${SITE_URL}/hero-dog.jpg`,
          width: 1200,
          height: 630,
          alt: 'Tailo — help shelter dogs',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/hero-dog.jpg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large' as const,
        'max-snippet': -1,
      },
    },
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

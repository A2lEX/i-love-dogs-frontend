import { notFound } from 'next/navigation';
import { Inter } from 'next/font/google';
import '../globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Providers } from '@/contexts/Providers';
import { DictionaryProvider } from '@/contexts/DictionaryContext';
import { getDictionary, hasLocale, locales } from './dictionaries';
import type { Locale } from './dictionaries';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-outfit',
  display: 'swap',
});

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
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

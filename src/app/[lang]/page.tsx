import Link from 'next/link';
import DogCard, { Dog } from '@/components/dogs/DogCard';
import styles from './page.module.css';
import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from './dictionaries';
import type { Locale } from './dictionaries';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

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

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const dogs = await getFeaturedDogs();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <img
          src="/hero-dog.jpg"
          alt=""
          className={styles.heroImage}
          role="presentation"
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <h1 className={styles.title}>{dict.home.hero_title}</h1>
          <p className={styles.subtitle}>{dict.home.hero_subtitle}</p>
          <div className={styles.ctaGroup}>
            <Link href={`/${lang}/dogs`} className={styles.btnPrimary}>
              {dict.home.cta}
            </Link>
          </div>
        </div>
      </section>

      {dogs.length > 0 && (
        <section className={styles.featured}>
          <h2 className={styles.sectionTitle}>{dict.home.featured_title}</h2>
          <div className={styles.grid}>
            {dogs.map((dog) => (
              <DogCard key={dog.id} dog={dog} lang={lang as Locale} />
            ))}
          </div>
        </section>
      )}

      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>{dict.home.how_title}</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <div>
              <span className={styles.stepNumber}>1</span>
              <p>{dict.home.step1}</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            </div>
            <div>
              <span className={styles.stepNumber}>2</span>
              <p>{dict.home.step2}</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" x2="4" y1="22" y2="15"/>
              </svg>
            </div>
            <div>
              <span className={styles.stepNumber}>3</span>
              <p>{dict.home.step3}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

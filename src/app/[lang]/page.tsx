import Link from 'next/link';
import DogCard, { Dog } from '@/components/dogs/DogCard';
import styles from './page.module.css';
import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from './dictionaries';
import type { Locale } from './dictionaries';

export const dynamic = 'force-dynamic';

async function getFeaturedDogs(): Promise<Dog[]> {
  try {
    const res = await fetch('http://localhost:3001/api/v1/dogs?limit=4', {
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
        <h1 className={styles.title}>{dict.home.hero_title}</h1>
        <p className={styles.subtitle}>{dict.home.hero_subtitle}</p>
        <div className={styles.ctaGroup}>
          <Link href={`/${lang}/dogs`} className={styles.btnPrimary}>
            {dict.home.cta}
          </Link>
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
            <span className={styles.stepNumber}>1</span>
            <p>{dict.home.step1}</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <p>{dict.home.step2}</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <p>{dict.home.step3}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

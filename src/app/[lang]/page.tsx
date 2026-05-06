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
  const d = dict.home;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'Tailo',
    url: `https://tailo.org/${lang}`,
    logo: 'https://tailo.org/logo.svg',
    description: dict.meta.description,
    areaServed: { '@type': 'Country', name: 'Montenegro' },
    sameAs: [],
  };

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <img src="/hero-dog.jpg" alt="" className={styles.heroImage} role="presentation" />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Montenegro</span>
          <h1 className={styles.title}>{d.hero_title}</h1>
          <p className={styles.subtitle}>{d.hero_subtitle}</p>
          <div className={styles.ctaGroup}>
            <Link href={`/${lang}/dogs`} className={styles.btnPrimary}>
              {d.cta}
            </Link>
            <a href="#how-it-works" className={styles.btnSecondary}>
              {d.cta_secondary}
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className={styles.stats}>
        <div className={styles.statsInner}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>127</span>
            <span className={styles.statLabel}>{d.stats_dogs}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>&euro;14,280</span>
            <span className={styles.statLabel}>{d.stats_donated}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>340</span>
            <span className={styles.statLabel}>{d.stats_walks}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNumber}>52</span>
            <span className={styles.statLabel}>{d.stats_volunteers}</span>
          </div>
        </div>
      </section>

      {/* ── Featured dogs ── */}
      {dogs.length > 0 && (
        <section className={styles.featured}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{d.featured_title}</h2>
            <p className={styles.sectionSubtitle}>{d.featured_subtitle}</p>
          </div>
          <div className={styles.grid}>
            {dogs.map((dog) => (
              <DogCard key={dog.id} dog={dog} lang={lang as Locale} />
            ))}
          </div>
          <div className={styles.viewAll}>
            <Link href={`/${lang}/dogs`} className={styles.btnOutline}>
              {d.view_all} &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* ── Ways to help ── */}
      <section className={styles.ways}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{d.ways_title}</h2>
          <p className={styles.sectionSubtitle}>{d.ways_subtitle}</p>
        </div>
        <div className={styles.waysGrid}>
          <div className={styles.wayCard}>
            <div className={styles.wayIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            </div>
            <h3 className={styles.wayTitle}>{d.way_donate_title}</h3>
            <p className={styles.wayDesc}>{d.way_donate_desc}</p>
          </div>
          <div className={styles.wayCard}>
            <div className={styles.wayIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0ZM20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/>
              </svg>
            </div>
            <h3 className={styles.wayTitle}>{d.way_walk_title}</h3>
            <p className={styles.wayDesc}>{d.way_walk_desc}</p>
          </div>
          <div className={styles.wayCard}>
            <div className={styles.wayIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <h3 className={styles.wayTitle}>{d.way_foster_title}</h3>
            <p className={styles.wayDesc}>{d.way_foster_desc}</p>
          </div>
          <div className={styles.wayCard}>
            <div className={styles.wayIcon}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/>
                <circle cx="6" cy="12" r="3"/>
                <circle cx="18" cy="19" r="3"/>
                <line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>
                <line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
              </svg>
            </div>
            <h3 className={styles.wayTitle}>{d.way_share_title}</h3>
            <p className={styles.wayDesc}>{d.way_share_desc}</p>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className={styles.howItWorks} id="how-it-works">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{d.how_title}</h2>
          <p className={styles.sectionSubtitle}>{d.how_subtitle}</p>
        </div>
        <div className={styles.steps}>
          <div className={styles.step}>
            <div className={styles.stepIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <span className={styles.stepNumber}>01</span>
            <p className={styles.stepText}>{d.step1}</p>
          </div>
          <div className={styles.stepArrow}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </div>
          <div className={styles.step}>
            <div className={styles.stepIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            </div>
            <span className={styles.stepNumber}>02</span>
            <p className={styles.stepText}>{d.step2}</p>
          </div>
          <div className={styles.stepArrow}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </div>
          <div className={styles.step}>
            <div className={styles.stepIcon}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" x2="4" y1="22" y2="15"/>
              </svg>
            </div>
            <span className={styles.stepNumber}>03</span>
            <p className={styles.stepText}>{d.step3}</p>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerInner}>
          <h2 className={styles.ctaBannerTitle}>{d.cta_banner_title}</h2>
          <p className={styles.ctaBannerSubtitle}>{d.cta_banner_subtitle}</p>
          <Link href={`/${lang}/dogs`} className={styles.btnPrimary}>
            {d.cta_banner_button}
          </Link>
        </div>
      </section>
    </div>
  );
}

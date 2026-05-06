import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, hasLocale } from '../../dictionaries';
import type { Locale } from '../../dictionaries';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Gallery } from './Gallery';
import { DonateSection } from './DonateSection';
import { StoriesBar } from './StoriesBar';
import styles from './DogPage.module.css';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tailo.org';

export async function generateMetadata({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) return {};
  const dog = await getDog(id);
  if (!dog) return { title: 'Not Found' };

  const title = `${dog.name} — ${dog.breed}, ${dog.city}`;
  const description = dog.description;
  const url = `${SITE_URL}/${lang}/dogs/${id}`;
  const image = dog.cover_photo_url || `${SITE_URL}/hero-dog.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        ['en', 'ru', 'sr'].map((l) => [l, `${SITE_URL}/${l}/dogs/${id}`])
      ),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Tailo',
      type: 'article',
      images: [{ url: image, width: 800, height: 600, alt: dog.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

interface DogDetail {
  id: string;
  name: string;
  breed: string;
  age_months: number;
  gender: 'male' | 'female' | 'unknown';
  description: string;
  status: string;
  city: string;
  cover_photo_url: string | null;
  photos: string[];
  created_at: string;
  curator: {
    id: string;
    shelter_name: string;
    city: string;
    description: string | null;
    payment_methods?: {
      id: string;
      type: string;
      label: string;
      value: string;
    }[];
  };
  goals: {
    id: string;
    category: string;
    title: string;
    description: string | null;
    amount_target: number;
    amount_collected: number;
    is_recurring: boolean;
    status: string;
  }[];
}

interface StoryItem {
  id: string;
  type: string;
  content: string;
  photo_urls: string[];
  created_at: string;
  curator: { name: string };
}

async function getDog(id: string): Promise<DogDetail | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://i-love-dog-api.girsa.ru/api/v1';
    const res = await fetch(`${apiUrl}/dogs/${id}`, { next: { revalidate: 0 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || json;
  } catch {
    return null;
  }
}

async function getStories(dogId: string): Promise<StoryItem[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://i-love-dog-api.girsa.ru/api/v1';
    const res = await fetch(`${apiUrl}/reports/dog/${dogId}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : json.data || [];
  } catch {
    return [];
  }
}

function formatAge(months: number, lang: Locale): string {
  const labels: Record<string, { m: string; y: string }> = { en: { m: 'mo', y: 'y' }, ru: { m: 'мес', y: 'г' }, pl: { m: 'mies', y: 'l' }, sr: { m: 'mj', y: 'g' } };
  const l = labels[lang] || labels.en;
  if (months < 12) return `${months} ${l.m}`;
  const years = Math.floor(months / 12);
  const m = months % 12;
  if (m === 0) return `${years} ${l.y}`;
  return `${years} ${l.y} ${m} ${l.m}`;
}

function formatMoney(amount: number): string {
  return (amount / 100).toLocaleString('ru-RU');
}

const categoryIcons: Record<string, string> = {
  medical: '\u{1F3E5}',
  food: '\u{1F96B}',
  shelter: '\u{1F3E0}',
  other: '\u{1F4E6}',
};

export default async function DogPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  if (!hasLocale(lang)) notFound();

  const [dict, dog, stories] = await Promise.all([
    getDictionary(lang as Locale),
    getDog(id),
    getStories(id),
  ]);

  if (!dog) notFound();

  const d = dict.dogPage;
  const activeGoals = dog.goals.filter(g => g.status === 'active');
  const allPhotos = dog.photos.length > 0 ? dog.photos : (dog.cover_photo_url ? [dog.cover_photo_url] : []);
  const paymentMethods = dog.curator?.payment_methods || [];

  return (
    <div className={styles.container}>
      <Link href={`/${lang}/dogs`} className={styles.backLink}>
        &larr; {d.back}
      </Link>

      <div className={styles.layout}>
        {/* Gallery */}
        <Gallery photos={allPhotos} alt={dog.name} />

        {/* Info */}
        <div className={styles.info}>
          <h1 className={styles.name}>{dog.name}</h1>

          <div className={styles.meta}>
            {dog.breed && <span className={styles.tag}>{dog.breed}</span>}
            <span className={styles.tag}>{formatAge(dog.age_months, lang as Locale)}</span>
            <span className={styles.tag}>{d[`gender_${dog.gender}`] || dog.gender}</span>
            <span className={styles.tag}>{dog.city}</span>
          </div>

          <p className={styles.description}>{dog.description}</p>

          {dog.curator && (
            <div className={styles.curator}>
              <span className={styles.curatorLabel}>{d.curator}</span>
              <span className={styles.curatorName}>{dog.curator.shelter_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Stories */}
      <StoriesBar
        stories={stories}
        dogName={dog.name}
        labels={{
          stories_title: d.stories_title || 'Updates',
          story_general: d.story_general || 'Update',
          story_medical: d.story_medical || 'Medical',
          story_walk: d.story_walk || 'Walk',
          story_adoption: d.story_adoption || 'Adoption',
        }}
      />

      {/* Goals */}
      {activeGoals.length > 0 && (
        <section className={styles.goals}>
          <h2 className={styles.sectionTitle}>{d.goals_title}</h2>
          <div className={styles.goalsGrid}>
            {activeGoals.map(goal => (
              <div key={goal.id} className={styles.goalCard}>
                <div className={styles.goalHeader}>
                  <span className={styles.goalIcon}>
                    {categoryIcons[goal.category] || categoryIcons.other}
                  </span>
                  <span className={styles.goalCategory}>{d[`goal_${goal.category}`] || goal.category}</span>
                  {goal.is_recurring && <span className={styles.recurringBadge}>{d.recurring}</span>}
                </div>
                <h3 className={styles.goalTitle}>{goal.title}</h3>
                {goal.description && <p className={styles.goalDesc}>{goal.description}</p>}
                <ProgressBar current={goal.amount_collected} target={goal.amount_target} />
                <div className={styles.goalAmount}>
                  {formatMoney(goal.amount_collected)} / {formatMoney(goal.amount_target)} {dict.progress.currency}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Donate */}
      <DonateSection
        methods={paymentMethods}
        title={d.donate_title}
        copiedText={d.copied}
      />
    </div>
  );
}

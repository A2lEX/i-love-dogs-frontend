import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDictionary, hasLocale } from '../../dictionaries';
import type { Locale } from '../../dictionaries';
import { ProgressBar } from '@/components/ui/ProgressBar';
import styles from './DogPage.module.css';

export const dynamic = 'force-dynamic';

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

function formatAge(months: number, lang: Locale): string {
  const labels = { en: { m: 'mo', y: 'y' }, ru: { m: 'мес', y: 'г' }, pl: { m: 'mies', y: 'l' } };
  const l = labels[lang];
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

  const [dict, dog] = await Promise.all([
    getDictionary(lang as Locale),
    getDog(id),
  ]);

  if (!dog) notFound();

  const d = dict.dogPage;
  const activeGoals = dog.goals.filter(g => g.status === 'active');
  const allPhotos = dog.photos.length > 0 ? dog.photos : (dog.cover_photo_url ? [dog.cover_photo_url] : []);

  return (
    <div className={styles.container}>
      <Link href={`/${lang}/dogs`} className={styles.backLink}>
        &larr; {d.back}
      </Link>

      <div className={styles.layout}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            <img
              src={allPhotos[0] || '/placeholder-dog.svg'}
              alt={dog.name}
              className={styles.image}
            />
          </div>
          {allPhotos.length > 1 && (
            <div className={styles.thumbs}>
              {allPhotos.slice(1, 5).map((url, i) => (
                <div key={i} className={styles.thumb}>
                  <img src={url} alt={`${dog.name} ${i + 2}`} className={styles.thumbImg} />
                </div>
              ))}
              {allPhotos.length > 5 && (
                <div className={styles.thumbMore}>+{allPhotos.length - 5}</div>
              )}
            </div>
          )}
        </div>

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
    </div>
  );
}

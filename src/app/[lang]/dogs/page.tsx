import DogCard, { Dog } from '@/components/dogs/DogCard';
import styles from './DogsPage.module.css';
import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '../dictionaries';
import type { Locale } from '../dictionaries';

export const dynamic = 'force-dynamic';

async function getDogs(): Promise<Dog[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://wallegro.ru:3001/api/v1';
    const res = await fetch(`${apiUrl}/dogs`, {
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch dogs');
    }

    const data = await res.json();
    return data.data.items;
  } catch (error) {
    console.error('Error fetching dogs:', error);
    return [];
  }
}

export default async function DogsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);
  const dogs = await getDogs();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{dict.dogs.title}</h1>
        <p className={styles.subtitle}>{dict.dogs.subtitle}</p>
      </header>

      {dogs.length > 0 ? (
        <div className={styles.grid}>
          {dogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} lang={lang as Locale} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>{dict.dogs.empty}</p>
        </div>
      )}
    </div>
  );
}

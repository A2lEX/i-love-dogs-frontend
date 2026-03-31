import Link from 'next/link';
import DogCard, { Dog } from '@/components/dogs/DogCard';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

async function getFeaturedDogs(): Promise<Dog[]> {
  try {
    const res = await fetch('http://localhost:3000/api/v1/dogs?limit=4', {
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data.items;
  } catch {
    return [];
  }
}

export default async function Home() {
  const dogs = await getFeaturedDogs();

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Помогите тем, кто не может попросить сам</h1>
        <p className={styles.subtitle}>
          Собаки из приютов ждут вашей помощи. Пожертвуйте на лечение, корм или просто сходите на прогулку.
        </p>
        <div className={styles.ctaGroup}>
          <Link href="/dogs" className={styles.btnPrimary}>
            Смотреть собак
          </Link>
        </div>
      </section>

      {dogs.length > 0 && (
        <section className={styles.featured}>
          <h2 className={styles.sectionTitle}>Им сейчас нужна помощь</h2>
          <div className={styles.grid}>
            {dogs.map((dog) => (
              <DogCard key={dog.id} dog={dog} />
            ))}
          </div>
        </section>
      )}

      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>Как это работает</h2>
        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <p>Выберите собаку и прочитайте её историю</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <p>Помогите — пожертвуйте на лечение, корм или передержку</p>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <p>Следите за отчётами и, если хотите, запишитесь на прогулку</p>
          </div>
        </div>
      </section>
    </div>
  );
}

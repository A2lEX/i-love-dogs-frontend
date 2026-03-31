import React from 'react';
import DogCard, { Dog } from '@/components/dogs/DogCard';
import styles from './DogsPage.module.css';

export const dynamic = 'force-dynamic';

async function getDogs(): Promise<Dog[]> {
  try {
    const res = await fetch('http://localhost:3000/api/v1/dogs', {
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

export default async function DogsPage() {
  const dogs = await getDogs();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Собаки</h1>
        <p className={styles.subtitle}>
          Каждый из них ждёт помощи. Выберите собаку, узнайте её историю.
        </p>
      </header>

      {dogs.length > 0 ? (
        <div className={styles.grid}>
          {dogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>Пока нет собак. Попробуйте позже.</p>
        </div>
      )}
    </div>
  );
}

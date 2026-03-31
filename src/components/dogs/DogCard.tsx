import React from 'react';
import Link from 'next/link';
import styles from './DogCard.module.css';

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age_months: number;
  gender: 'male' | 'female' | 'unknown';
  description: string;
  city: string;
  cover_photo_url: string | null;
}

interface DogCardProps {
  dog: Dog;
}

function formatAge(months: number): string {
  if (months < 12) {
    return `${months} мес`;
  }
  const years = Math.floor(months / 12);
  const m = months % 12;
  if (m === 0) return `${years} г`;
  return `${years} г ${m} мес`;
}

const DogCard: React.FC<DogCardProps> = ({ dog }) => {
  return (
    <Link href={`/dogs/${dog.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={dog.cover_photo_url || '/placeholder-dog.jpg'}
          alt={dog.name}
          className={styles.image}
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{dog.name}</h3>
        <span className={styles.meta}>
          {[dog.breed, formatAge(dog.age_months), dog.city].filter(Boolean).join(' · ')}
        </span>
      </div>
    </Link>
  );
};

export default DogCard;

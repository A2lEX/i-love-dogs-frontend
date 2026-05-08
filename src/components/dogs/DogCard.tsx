import React from 'react';
import Link from 'next/link';
import styles from './DogCard.module.css';
import type { Locale } from '@/i18n/config';

import { Dog } from '@/types';

interface DogCardProps {
  dog: Dog;
  lang: Locale;
}

function formatAge(months: number, lang: Locale): string {
  const labels: Record<string, { m: string; y: string }> = { en: { m: 'mo', y: 'y' }, ru: { m: 'мес', y: 'г' }, pl: { m: 'mies', y: 'l' }, sr: { m: 'mj', y: 'g' } };
  const l = labels[lang] || labels.en;
  if (months < 12) {
    return `${months} ${l.m}`;
  }
  const years = Math.floor(months / 12);
  const m = months % 12;
  if (m === 0) return `${years} ${l.y}`;
  return `${years} ${l.y} ${m} ${l.m}`;
}

const DogCard: React.FC<DogCardProps> = ({ dog, lang }) => {
  return (
    <Link href={`/${lang}/dogs/${dog.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={dog.cover_photo_url || '/placeholder-dog.svg'}
          alt={dog.name}
          className={styles.image}
        />
      </div>
      <div className={styles.content}>
        <h3 className={styles.name}>{dog.name}</h3>
        <span className={styles.meta}>
          {[dog.breed, formatAge(dog.age_months, lang), dog.city].filter(Boolean).join(' · ')}
        </span>
      </div>
    </Link>
  );
};

export default DogCard;

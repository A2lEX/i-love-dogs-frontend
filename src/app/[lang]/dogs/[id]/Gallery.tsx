'use client';

import { useState } from 'react';
import styles from './DogPage.module.css';

interface GalleryProps {
  photos: string[];
  alt: string;
}

export function Gallery({ photos, alt }: GalleryProps) {
  const [active, setActive] = useState(0);
  const list = photos.length > 0 ? photos : ['/placeholder-dog.svg'];
  const current = list[active] ?? list[0];
  const hasMany = list.length > 1;

  const prev = () => setActive((i) => (i - 1 + list.length) % list.length);
  const next = () => setActive((i) => (i + 1) % list.length);

  return (
    <div className={styles.gallery}>
      <div className={styles.mainImage}>
        <img src={current} alt={alt} className={styles.image} />
        {hasMany && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous"
              className={`${styles.navBtn} ${styles.navPrev}`}
            >
              &#8249;
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next"
              className={`${styles.navBtn} ${styles.navNext}`}
            >
              &#8250;
            </button>
            <div className={styles.counter}>
              {active + 1} / {list.length}
            </div>
          </>
        )}
      </div>
      {hasMany && (
        <div className={styles.thumbs}>
          {list.map((url, i) => (
            <button
              type="button"
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Photo ${i + 1}`}
              className={`${styles.thumb} ${i === active ? styles.thumbActive : ''}`}
            >
              <img src={url} alt={`${alt} ${i + 1}`} className={styles.thumbImg} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

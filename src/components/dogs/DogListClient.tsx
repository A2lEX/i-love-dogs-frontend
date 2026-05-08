'use client';

import React, { useState, useMemo } from 'react';
import { Dog } from '@/types';
import DogCard from './DogCard';
import { DogFilters, FilterState } from './DogFilters';
import { calculateDistance, getCityCoords } from '@/lib/distance';
import styles from '@/app/[lang]/dogs/DogsPage.module.css';
import type { Locale } from '@/i18n/config';

interface DogListClientProps {
  initialDogs: Dog[];
  lang: Locale;
  emptyText: string;
}

export function DogListClient({ initialDogs, lang, emptyText }: DogListClientProps) {
  const [filters, setFilters] = useState<FilterState>({
    location: null,
    radiusKm: 'any',
    gender: 'all',
    breed: 'all',
  });

  const availableBreeds = useMemo(() => {
    const breeds = new Set<string>();
    initialDogs.forEach(dog => {
      if (dog.breed) breeds.add(dog.breed);
    });
    return Array.from(breeds).sort();
  }, [initialDogs]);

  const filteredDogs = useMemo(() => {
    return initialDogs.filter(dog => {
      // Gender filter
      if (filters.gender !== 'all' && dog.gender !== filters.gender) {
        return false;
      }
      
      // Breed filter
      if (filters.breed !== 'all' && dog.breed !== filters.breed) {
        return false;
      }
      
      // Distance filter
      if (filters.location && filters.radiusKm !== 'any') {
        const dogCoords = getCityCoords(dog.city, dog.city_lat, dog.city_lng);
        if (dogCoords) {
          const distance = calculateDistance(
            filters.location.lat, 
            filters.location.lng, 
            dogCoords.lat, 
            dogCoords.lng
          );
          if (distance > filters.radiusKm) {
            return false;
          }
        } else {
          // If we can't determine dog's location, and a strict radius is set, we might exclude it, 
          // but for better UX we could include it, or exclude it. Let's exclude for strictness.
          return false;
        }
      }
      
      return true;
    });
  }, [initialDogs, filters]);

  return (
    <>
      <DogFilters 
        filters={filters} 
        onChange={setFilters} 
        availableBreeds={availableBreeds} 
      />
      
      {filteredDogs.length > 0 ? (
        <div className={styles.grid}>
          {filteredDogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} lang={lang} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <p>{emptyText}</p>
        </div>
      )}
    </>
  );
}

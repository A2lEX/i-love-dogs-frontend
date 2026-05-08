import React, { useMemo } from 'react';
import { CityAutocomplete, CityResult } from '@/components/ui/CityAutocomplete';
import { Dog } from '@/types';
import styles from './DogFilters.module.css';

export interface FilterState {
  location: { name: string; lat: number; lng: number } | null;
  radiusKm: number | 'any';
  gender: 'all' | Dog['gender'];
  breed: string;
}

interface DogFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availableBreeds: string[];
}

export function DogFilters({ filters, onChange, availableBreeds }: DogFiltersProps) {
  const handleLocationChange = (cityName: string, result?: CityResult) => {
    if (result) {
      onChange({ ...filters, location: { name: cityName, lat: result.lat, lng: result.lng } });
    } else {
      onChange({ ...filters, location: null });
    }
  };

  const handleGeolocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onChange({
            ...filters,
            location: {
              name: 'My Location',
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            radiusKm: filters.radiusKm === 'any' ? 50 : filters.radiusKm, // set a default radius if 'any'
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Could not get your location. Please type a city instead.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterGroup}>
        <label className={styles.label}>Location</label>
        <div className={styles.locationInputGroup}>
          <div className={styles.autocompleteWrapper}>
            <CityAutocomplete
              value={filters.location?.name || ''}
              onChange={handleLocationChange}
              placeholder="City..."
            />
          </div>
          <button 
            className={styles.geoButton} 
            onClick={handleGeolocation}
            title="Use my location"
            type="button"
          >
            📍
          </button>
        </div>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>Distance</label>
        <select 
          className={styles.select}
          value={filters.radiusKm}
          onChange={(e) => onChange({ ...filters, radiusKm: e.target.value === 'any' ? 'any' : Number(e.target.value) })}
          disabled={!filters.location}
        >
          <option value="any">Anywhere</option>
          <option value={10}>+ 10 km</option>
          <option value={25}>+ 25 km</option>
          <option value={50}>+ 50 km</option>
          <option value={100}>+ 100 km</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>Gender</label>
        <select 
          className={styles.select}
          value={filters.gender}
          onChange={(e) => onChange({ ...filters, gender: e.target.value as FilterState['gender'] })}
        >
          <option value="all">All</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>Breed</label>
        <select 
          className={styles.select}
          value={filters.breed}
          onChange={(e) => onChange({ ...filters, breed: e.target.value })}
        >
          <option value="all">All Breeds</option>
          {availableBreeds.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

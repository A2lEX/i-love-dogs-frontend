'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './CityAutocomplete.module.css';

export interface CityResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lng: number;
  /** Display string: "City, State, Country" or "City, Country" */
  displayName: string;
}

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string, result?: CityResult) => void;
  placeholder?: string;
  required?: boolean;
  /** Minimum characters before triggering search */
  minChars?: number;
  /** Debounce delay in ms */
  debounceMs?: number;
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    name?: string;
    city?: string;
    county?: string;
    state?: string;
    country?: string;
    osm_value?: string;
    type?: string;
  };
}

async function searchCities(query: string): Promise<CityResult[]> {
  // Photon API — free OSM geocoder, no API key needed
  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=7&lang=en&osm_tag=place:city&osm_tag=place:town&osm_tag=place:village`;

  const res = await fetch(url);
  if (!res.ok) return [];

  const data = await res.json();
  const features: PhotonFeature[] = data.features || [];

  const seen = new Set<string>();
  const results: CityResult[] = [];

  for (const f of features) {
    const props = f.properties;
    const name = props.name || props.city || '';
    const country = props.country || '';
    const state = props.state || '';
    if (!name) continue;

    const key = `${name}|${state}|${country}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const parts = [name];
    if (state) parts.push(state);
    if (country) parts.push(country);

    results.push({
      name,
      country,
      state,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      displayName: parts.join(', '),
    });
  }

  return results;
}

export function CityAutocomplete({
  value,
  onChange,
  placeholder = 'Start typing a city name...',
  required = false,
  minChars = 2,
  debounceMs = 300,
}: CityAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<CityResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hasSelected, setHasSelected] = useState(!!value);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Sync external value changes
  useEffect(() => {
    if (value !== inputValue && !isOpen) {
      setInputValue(value);
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(
    async (query: string) => {
      if (query.length < minChars) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchCities(query);
        setSuggestions(results);
        setIsOpen(results.length > 0);
        setActiveIndex(-1);
      } catch {
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    },
    [minChars]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setHasSelected(false);
    onChange(val, undefined);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), debounceMs);
  };

  const selectCity = (result: CityResult) => {
    setInputValue(result.name);
    setHasSelected(true);
    onChange(result.name, result);
    setIsOpen(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          selectCity(suggestions[activeIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.children;
      if (items[activeIndex]) {
        (items[activeIndex] as HTMLElement).scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          type="text"
          className={`${styles.input} ${hasSelected ? styles.inputSelected : ''}`}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0 && !hasSelected) setIsOpen(true);
          }}
          placeholder={placeholder}
          required={required}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="city-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `city-option-${activeIndex}` : undefined}
          autoComplete="off"
        />
        {isLoading && (
          <div className={styles.spinner}>
            <div className={styles.spinnerDot} />
          </div>
        )}
        {hasSelected && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => {
              setInputValue('');
              setHasSelected(false);
              onChange('', undefined);
              inputRef.current?.focus();
            }}
            aria-label="Clear city"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          id="city-suggestions"
          className={styles.dropdown}
          role="listbox"
        >
          {suggestions.map((result, index) => (
            <li
              key={`${result.lat}-${result.lng}-${index}`}
              id={`city-option-${index}`}
              className={`${styles.option} ${index === activeIndex ? styles.optionActive : ''}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur
                selectCity(result);
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span className={styles.optionIcon}>📍</span>
              <div className={styles.optionText}>
                <span className={styles.optionName}>{result.name}</span>
                <span className={styles.optionMeta}>
                  {[result.state, result.country].filter(Boolean).join(', ')}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

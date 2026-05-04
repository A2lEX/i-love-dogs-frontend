'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { regions, defaultRegion } from '@/config/regions';
import type { RegionConfig } from '@/config/regions';

type RegionContextType = {
  region: string;
  regionConfig: RegionConfig;
  currency: string;
  setCurrency: (currency: string) => void;
  countryCode: string;
};

const RegionContext = createContext<RegionContextType | null>(null);

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function setDocCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

export function RegionProvider({ children }: { children: React.ReactNode }) {
  const regionKey = getCookie('x-region') || defaultRegion;
  const regionConfig = regions[regionKey] || regions[defaultRegion];
  const countryCode = regionKey.toUpperCase();

  const [currency, setCurrencyState] = useState<string>(
    () => getCookie('preferred_currency') || regionConfig.currency,
  );

  const setCurrency = useCallback(
    (newCurrency: string) => {
      if (regionConfig.currencyOptions.includes(newCurrency)) {
        setCurrencyState(newCurrency);
        setDocCookie('preferred_currency', newCurrency);
      }
    },
    [regionConfig.currencyOptions],
  );

  return (
    <RegionContext.Provider
      value={{ region: regionKey, regionConfig, currency, setCurrency, countryCode }}
    >
      {children}
    </RegionContext.Provider>
  );
}

export function useRegion() {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error('useRegion must be used within RegionProvider');
  return ctx;
}

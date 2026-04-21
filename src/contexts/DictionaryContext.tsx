'use client';

import React, { createContext, useContext } from 'react';
import type { Locale } from '@/i18n/config';

type Dictionary = Record<string, Record<string, string>>;

interface DictionaryContextType {
  dict: Dictionary;
  lang: Locale;
}

const DictionaryContext = createContext<DictionaryContextType | undefined>(undefined);

export function DictionaryProvider({
  children,
  dict,
  lang,
}: {
  children: React.ReactNode;
  dict: Dictionary;
  lang: Locale;
}) {
  return (
    <DictionaryContext.Provider value={{ dict, lang }}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary() {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error('useDictionary must be used within a DictionaryProvider');
  }
  return context;
}

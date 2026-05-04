'use client';

import React from 'react';
import { AuthProvider } from './AuthContext';
import { RegionProvider } from './RegionContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RegionProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </RegionProvider>
  );
}

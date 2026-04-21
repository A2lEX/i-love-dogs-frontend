'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    const lang = pathname.split('/')[1] || 'en';
    router.push(`/${lang}/auth/login`);
  }, [router, pathname]);

  const normalizeUser = (userData: Partial<User>): User | null => {
    if (!userData) return null;
    
    const roles = userData.roles || (userData.id ? ['donor'] : []);
    
    return {
      id: userData.id || '',
      email: userData.email || '',
      name: userData.name || '',
      roles: roles,
    };
  };

  const fetchMe = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      // Handle nested data from ResponseInterceptor
      const userData = response.data.data || response.data;
      const normalized = normalizeUser(userData);
      setUser(normalized);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      console.error('Failed to fetch user profile', err);
      // Optional: if it's 401, clear everything
      // logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Try to load user from local storage
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (token) {
      if (storedUser) {
        try {
          setUser(normalizeUser(JSON.parse(storedUser)));
        } catch (e) {
          console.error('Failed to parse stored user', e);
        }
      }
      
      // Always fetch fresh data from API if we have a token
      fetchMe();
    } else {
      setIsLoading(false);
    }
    
    // Listen to unauthorized events from our API interceptor
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout, fetchMe]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(normalizeUser(userData));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

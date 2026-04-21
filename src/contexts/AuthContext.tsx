'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

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

  const normalizeUser = (userData: any): User | null => {
    if (!userData) return null;
    
    const roles = userData.roles || (userData.role ? [userData.role] : []);
    
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      roles: roles,
    };
  };

  useEffect(() => {
    // Try to load user from local storage
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(normalizeUser(userData));
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);

    // Listen to unauthorized events from our API interceptor
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [logout]);

  const login = (token: string, userData: any) => {
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

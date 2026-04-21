'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDictionary } from '@/contexts/DictionaryContext';
import styles from './ProfilePage.module.css';
import { Button } from '@/components/ui/Button';

import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth();
  const { dict, lang } = useDictionary();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!user || !dict.profile) {
    return (
      <div className={styles.container}>
        <div className={styles.errorBox}>
          <h1>{dict.profile?.no_user || 'User not found'}</h1>
          <Link href={`/${lang}/auth/login`} className={styles.btnLink}>
            <Button>{dict.nav.login}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>{dict.profile.title}</h1>
        
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.label}>{dict.profile.name}:</span>
            <span className={styles.value}>{user.name}</span>
          </div>
          
          <div className={styles.infoItem}>
            <span className={styles.label}>{dict.profile.email}:</span>
            <span className={styles.value}>{user.email}</span>
          </div>
          
          <div className={styles.infoItem}>
            <span className={styles.label}>{dict.profile.role}:</span>
            <span className={styles.value}>
              <span className={styles.badge}>{user.roles.join(', ') || 'donor'}</span>
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <Button onClick={logout} variant="outline" className={styles.btnLogout}>
            {dict.profile.logout}
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDictionary } from '@/contexts/DictionaryContext';
import { PaymentMethodsSection } from '../PaymentMethodsSection';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import styles from './PaymentMethodsPage.module.css';

export default function PaymentMethodsPage() {
  const { user, isLoading } = useAuth();
  const { dict, lang } = useDictionary();
  const t = dict.paymentMethods || {};

  if (isLoading) {
    return <div className={styles.container}><div className={styles.loading}>Loading...</div></div>;
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <Link href={`/${lang}/auth/login`}><Button>{dict.nav?.login || 'Sign in'}</Button></Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Link href={`/${lang}/profile`} className={styles.back}>
        ← {dict.profile?.title || 'Profile'}
      </Link>
      <div className={styles.card}>
        <PaymentMethodsSection />
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useDictionary } from '@/contexts/DictionaryContext';
import styles from '../auth.module.css';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { dict, lang } = useDictionary();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      const token = data.access_token || data.token;
      login(token, data.user || { id: 'some-id', email, name: 'User', roles: [] });

      const returnTo = searchParams.get('returnTo') || `/${lang}/dogs`;
      router.push(returnTo);
    } catch (err: unknown) {
      if (err !== null && typeof err === 'object' && 'response' in err) {
        const errorResp = err as { response?: { data?: { message?: string } } };
        setError(errorResp.response?.data?.message || dict.auth.login_error);
      } else {
        setError(dict.auth.login_error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{dict.auth.login_title}</h1>
          <p className={styles.subtitle}>{dict.auth.login_subtitle}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.errorBox}>{error}</div>}

          <Input
            label={dict.auth.label_email}
            type="email"
            placeholder={dict.auth.placeholder_email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label={dict.auth.label_password}
            type="password"
            placeholder={dict.auth.placeholder_password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" className={styles.btnSubmit} fullWidth disabled={loading}>
            {loading ? dict.auth.login_loading : dict.auth.login_button}
          </Button>
        </form>

        <div className={styles.footer}>
          {dict.auth.no_account}{' '}
          <Link href={`/${lang}/auth/register`} className={styles.link}>
            {dict.auth.link_register}
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useDictionary } from '@/contexts/DictionaryContext';
import styles from '../auth.module.css';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { dict, lang } = useDictionary();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', { email, password, name });
      router.push(`/${lang}/auth/login`);
    } catch (err: unknown) {
      if (err !== null && typeof err === 'object' && 'response' in err) {
        const errorResp = err as { response?: { data?: { message?: string } } };
        setError(errorResp.response?.data?.message || dict.auth.register_error);
      } else {
        setError(dict.auth.register_error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>{dict.auth.register_title}</h1>
          <p className={styles.subtitle}>{dict.auth.register_subtitle}</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.errorBox}>{error}</div>}

          <Input
            label={dict.auth.label_name}
            placeholder={dict.auth.placeholder_name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            {loading ? dict.auth.register_loading : dict.auth.register_button}
          </Button>
        </form>

        <div className={styles.footer}>
          {dict.auth.has_account}{' '}
          <Link href={`/${lang}/auth/login`} className={styles.link}>
            {dict.auth.link_login}
          </Link>
        </div>
      </div>
    </div>
  );
}

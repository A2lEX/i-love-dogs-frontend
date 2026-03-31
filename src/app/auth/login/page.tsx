'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      const token = data.access_token || data.token;
      login(token, data.user || { id: 'some-id', email, name: 'User', roles: [] });

      const returnTo = searchParams.get('returnTo') || '/dogs';
      router.push(returnTo);
    } catch (err: unknown) {
      if (err !== null && typeof err === 'object' && 'response' in err) {
        const errorResp = err as { response?: { data?: { message?: string } } };
        setError(errorResp.response?.data?.message || 'Неверный email или пароль.');
      } else {
        setError('Неверный email или пароль.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Вход</h1>
          <p className={styles.subtitle}>Войдите, чтобы помогать собакам и записываться на прогулки.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.errorBox}>{error}</div>}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Пароль"
            type="password"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" className={styles.btnSubmit} fullWidth disabled={loading}>
            {loading ? 'Входим...' : 'Войти'}
          </Button>
        </form>

        <div className={styles.footer}>
          Нет аккаунта? <Link href="/auth/register" className={styles.link}>Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  );
}

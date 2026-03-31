'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', { email, password, name });
      router.push('/auth/login');
    } catch (err: unknown) {
      if (err !== null && typeof err === 'object' && 'response' in err) {
        const errorResp = err as { response?: { data?: { message?: string } } };
        setError(errorResp.response?.data?.message || 'Не удалось зарегистрироваться.');
      } else {
        setError('Не удалось зарегистрироваться.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Регистрация</h1>
          <p className={styles.subtitle}>Создайте аккаунт, чтобы помогать собакам.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.errorBox}>{error}</div>}

          <Input
            label="Имя"
            placeholder="Ваше имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
            {loading ? 'Создаём...' : 'Создать аккаунт'}
          </Button>
        </form>

        <div className={styles.footer}>
          Уже есть аккаунт? <Link href="/auth/login" className={styles.link}>Войти</Link>
        </div>
      </div>
    </div>
  );
}

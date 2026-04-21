'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDictionary } from '@/contexts/DictionaryContext';
import { useAuth } from '@/contexts/AuthContext';
import { locales } from '@/i18n/config';
import type { Locale } from '@/i18n/config';
import styles from './Header.module.css';

export default function Header() {
  const { dict, lang } = useDictionary();
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();

  const switchLocale = (newLang: Locale) => {
    const segments = pathname.split('/');
    segments[1] = newLang;
    return segments.join('/');
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.nav}`}>
        <Link href={`/${lang}`} className={styles.logo}>
          DogCare
        </Link>
        <div className={styles.links}>
          <Link href={`/${lang}/dogs`} className={styles.link}>
            {dict.nav.dogs}
          </Link>
        </div>
        <div className={styles.authGroup}>
          <div className={styles.langSwitcher}>
            {locales.map((loc) => (
              <Link
                key={loc}
                href={switchLocale(loc)}
                className={`${styles.langBtn} ${loc === lang ? styles.langActive : ''}`}
              >
                {loc.toUpperCase()}
              </Link>
            ))}
          </div>
          
          {isAuthenticated && user ? (
            <div className={styles.userInfo}>
              <Link href={`/${lang}/profile`} className={styles.userName}>
                {user.email}
              </Link>
              <button onClick={logout} className={styles.btnLogout}>
                {dict.auth.logout_button || 'Logout'}
              </button>
            </div>
          ) : (
            <>
              <Link href={`/${lang}/auth/login`} className={styles.btnLogin}>
                {dict.nav.login}
              </Link>
              <Link href={`/${lang}/auth/register`} className={styles.btnRegister}>
                {dict.nav.register}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

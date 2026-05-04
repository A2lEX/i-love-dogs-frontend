'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDictionary } from '@/contexts/DictionaryContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRegion } from '@/contexts/RegionContext';
import styles from './Header.module.css';

export default function Header() {
  const { dict, lang } = useDictionary();
  const { user, isAuthenticated, logout } = useAuth();
  const { regionConfig, currency, setCurrency } = useRegion();
  const pathname = usePathname();

  const switchLocale = (newLang: string) => {
    const segments = pathname.split('/');
    segments[1] = newLang;
    return segments.join('/');
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.nav}`}>
        <Link href={`/${lang}`} className={styles.logo}>
          <img src="/logo.svg" alt="DogCare" width={140} height={32} />
        </Link>
        <div className={styles.links}>
          <Link href={`/${lang}/dogs`} className={styles.link}>
            {dict.nav.dogs}
          </Link>
        </div>
        <div className={styles.authGroup}>
          <div className={styles.langSwitcher}>
            {regionConfig.languages.map((loc) => (
              <Link
                key={loc}
                href={switchLocale(loc)}
                className={`${styles.langBtn} ${loc === lang ? styles.langActive : ''}`}
              >
                {loc.toUpperCase()}
              </Link>
            ))}
          </div>

          <select
            className={styles.currencySelect}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {regionConfig.currencyOptions.map((cur) => (
              <option key={cur} value={cur}>
                {cur}
              </option>
            ))}
          </select>

          {isAuthenticated && user ? (
            <div className={styles.userInfo}>
              <Link href={`/${lang}/profile`} className={styles.userName}>
                {user.email}
              </Link>
              <button onClick={logout} className={styles.btnLogout}>
                {dict.profile?.logout || 'Logout'}
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

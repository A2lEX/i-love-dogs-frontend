'use client';

import { useState, useEffect } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const switchLocale = (newLang: string) => {
    const segments = pathname.split('/');
    segments[1] = newLang;
    return segments.join('/');
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.nav}`}>
        <Link href={`/${lang}`} className={styles.logo}>
          <img src="/logo.svg" alt="Tailo" width={140} height={32} />
        </Link>

        {/* Desktop nav — placeholder for future links */}
        <div className={styles.desktopNav} />

        <div className={styles.desktopRight}>
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
              <option key={cur} value={cur}>{cur}</option>
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

        {/* Burger button */}
        <button
          className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile overlay */}
      {menuOpen && <div className={styles.overlay} onClick={() => setMenuOpen(false)} />}

      {/* Mobile slide panel */}
      <div className={`${styles.mobilePanel} ${menuOpen ? styles.mobilePanelOpen : ''}`}>
        <nav className={styles.mobileNav}>
          {isAuthenticated && user ? (
            <>
              <Link href={`/${lang}/profile`} className={styles.mobileLink}>
                {user.email}
              </Link>
              <button onClick={logout} className={styles.mobileLink}>
                {dict.profile?.logout || 'Logout'}
              </button>
            </>
          ) : (
            <>
              <Link href={`/${lang}/auth/login`} className={styles.mobileLink}>
                {dict.nav.login}
              </Link>
              <Link href={`/${lang}/auth/register`} className={styles.mobileLink}>
                {dict.nav.register}
              </Link>
            </>
          )}
        </nav>

        <div className={styles.mobileMeta}>
          <div className={styles.mobileLangRow}>
            {regionConfig.languages.map((loc) => (
              <Link
                key={loc}
                href={switchLocale(loc)}
                className={`${styles.mobileLangBtn} ${loc === lang ? styles.mobileLangActive : ''}`}
              >
                {loc.toUpperCase()}
              </Link>
            ))}
          </div>

          <select
            className={styles.mobileCurrency}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {regionConfig.currencyOptions.map((cur) => (
              <option key={cur} value={cur}>{cur}</option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}

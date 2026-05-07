'use client';

import Link from 'next/link';
import { useDictionary } from '@/contexts/DictionaryContext';
import styles from './Footer.module.css';

export default function Footer() {
  const { dict, lang } = useDictionary();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brandSection}>
            <Link href={`/${lang}`} className={styles.brand}>
              <img src="/logo.svg" alt="Tailo" width={120} height={28} />
            </Link>
            <p className={styles.description}>
              {dict.meta.description}
            </p>
            <div className={styles.socials}>
              <a href="#" className={styles.socialIcon} aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" className={styles.socialIcon} aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className={styles.socialIcon} aria-label="Telegram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className={styles.title}>{dict.nav.dogs}</h4>
            <ul className={styles.menu}>
              <li>
                <Link href={`/${lang}/dogs`} className={styles.link}>
                  {dict.nav.dogs}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/success-stories`} className={styles.link}>
                  {dict.footer.success_stories}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/about`} className={styles.link}>
                  {dict.footer.about}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={styles.title}>{dict.footer.help}</h4>
            <ul className={styles.menu}>
              <li>
                <Link href={`/${lang}/dogs`} className={styles.link}>
                  {dict.footer.donate}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/about`} className={styles.link}>
                  {dict.footer.volunteer}
                </Link>
              </li>
              <li>
                <Link href={`/${lang}/success-stories`} className={styles.link}>
                  {dict.footer.share}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={styles.title}>{dict.footer.contact}</h4>
            <ul className={styles.menu}>
              <li>
                <a href="mailto:info@tailo.org" className={styles.emailLink}>
                  info@tailo.org
                </a>
              </li>
              <li className={styles.description}>
                Montenegro, Podgorica<br />
                Business Center "Capital"
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <span className={styles.copy}>
            &copy; {new Date().getFullYear()} Tailo. {dict.meta.description}
          </span>
          <div className={styles.legal}>
            <Link href={`/${lang}/privacy`} className={styles.legalLink}>
              {dict.footer.privacy}
            </Link>
            <Link href={`/${lang}/terms`} className={styles.legalLink}>
              {dict.footer.terms}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

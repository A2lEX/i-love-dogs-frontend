'use client';

import { useState } from 'react';
import styles from './DonateSection.module.css';

interface PaymentMethod {
  id: string;
  type: string;
  label: string;
  value: string;
}

const TYPE_ICONS: Record<string, string> = {
  paypal: 'PP',
  iban: 'BK',
  revolut: 'RV',
  wise: 'WS',
  crypto: 'CR',
  other: '$$',
};

const TYPE_COLORS: Record<string, string> = {
  paypal: '#003087',
  iban: '#1a5276',
  revolut: '#0075eb',
  wise: '#9fe870',
  crypto: '#f7931a',
  other: '#6b7280',
};

interface Props {
  methods: PaymentMethod[];
  title: string;
  copiedText: string;
}

export function DonateSection({ methods, title, copiedText }: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (methods.length === 0) return null;

  const handleCopy = async (method: PaymentMethod) => {
    try {
      await navigator.clipboard.writeText(method.value);
      setCopiedId(method.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = method.value;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedId(method.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const isLink = (value: string) =>
    value.startsWith('http://') || value.startsWith('https://');

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.methods}>
        {methods.map((m) => (
          <div key={m.id} className={styles.method}>
            <div
              className={styles.icon}
              style={{ background: TYPE_COLORS[m.type] || TYPE_COLORS.other }}
            >
              {TYPE_ICONS[m.type] || TYPE_ICONS.other}
            </div>
            <div className={styles.info}>
              <span className={styles.label}>{m.label}</span>
              <span className={styles.value}>
                {isLink(m.value) ? (
                  <a href={m.value} target="_blank" rel="noopener noreferrer">
                    {m.value}
                  </a>
                ) : (
                  m.value
                )}
              </span>
            </div>
            <button
              className={`${styles.copyBtn} ${copiedId === m.id ? styles.copied : ''}`}
              onClick={() => handleCopy(m)}
            >
              {copiedId === m.id ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="14" height="14" x="8" y="8" rx="2"/>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
              )}
              <span>{copiedId === m.id ? copiedText : 'Copy'}</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

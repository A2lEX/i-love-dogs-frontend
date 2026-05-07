'use client';

import { useState } from 'react';
import { useDictionary } from '@/contexts/DictionaryContext';
import styles from './ContactForm.module.css';

import { api } from '@/lib/api';

export default function ContactForm() {
  const { dict } = useDictionary();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string,
    };

    try {
      const res = await api.post('/reports/contact', data);

      if (res.status === 200 || res.status === 201) {
        setStatus('success');
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setStatus('error');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{dict.contact.title}</h2>
      <p className={styles.subtitle}>{dict.contact.subtitle}</p>

      {status === 'success' ? (
        <div className={styles.success}>{dict.contact.success}</div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.group}>
            <label htmlFor="name" className={styles.label}>{dict.contact.name}</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              required 
              className={styles.input}
              placeholder={dict.contact.name}
            />
          </div>
          
          <div className={styles.group}>
            <label htmlFor="email" className={styles.label}>{dict.contact.email}</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              className={styles.input}
              placeholder="example@email.com"
            />
          </div>

          <div className={styles.group}>
            <label htmlFor="message" className={styles.label}>{dict.contact.message}</label>
            <textarea 
              id="message" 
              name="message" 
              required 
              className={styles.textarea}
              placeholder={dict.contact.message}
            />
          </div>

          {status === 'error' && <div className={styles.error}>{dict.contact.error}</div>}

          <button 
            type="submit" 
            className={styles.submit} 
            disabled={status === 'loading'}
          >
            {status === 'loading' ? dict.contact.sending : dict.contact.send}
          </button>
        </form>
      )}
    </div>
  );
}

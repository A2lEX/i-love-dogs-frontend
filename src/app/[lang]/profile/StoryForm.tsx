'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import styles from './StoryForm.module.css';

interface StoryFormProps {
  dogId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const TYPES = [
  { value: 'general', label: 'Update', icon: '\u{1F4F7}' },
  { value: 'medical', label: 'Medical', icon: '\u{1F3E5}' },
  { value: 'walk', label: 'Walk', icon: '\u{1F43E}' },
  { value: 'adoption', label: 'Adoption', icon: '\u{1F3E0}' },
];

export function StoryForm({ dogId, onSuccess, onCancel }: StoryFormProps) {
  const [type, setType] = useState('general');
  const [content, setContent] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const photo_urls = photoUrl.trim() ? [photoUrl.trim()] : [];
      await api.post('/reports', {
        dog_id: dogId,
        type,
        content,
        photo_urls,
      });
      onSuccess();
    } catch {
      setError('Failed to post story');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.typeRow}>
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            className={`${styles.typeBtn} ${type === t.value ? styles.typeBtnActive : ''}`}
            onClick={() => setType(t.value)}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      <textarea
        className={styles.textarea}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Tell the story... What happened today?"
        required
        rows={4}
      />

      <input
        type="url"
        className={styles.input}
        value={photoUrl}
        onChange={(e) => setPhotoUrl(e.target.value)}
        placeholder="Photo URL (optional)"
      />

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || !content.trim()}>
          {saving ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </form>
  );
}

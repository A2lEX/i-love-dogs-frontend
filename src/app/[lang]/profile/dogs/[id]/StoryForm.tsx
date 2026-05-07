'use client';

import React, { useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { Button } from '@/components/ui/Button';
import styles from './StoryForm.module.css';

interface StoryFormProps {
  dogId: string;
  onSuccess: () => void;
}

const TYPES = [
  { value: 'general', label: 'Update', icon: '\u{1F4F7}' },
  { value: 'medical', label: 'Medical', icon: '\u{1F3E5}' },
  { value: 'walk', label: 'Walk', icon: '\u{1F43E}' },
  { value: 'adoption', label: 'Adoption', icon: '\u{1F3E0}' },
];

export function StoryForm({ dogId, onSuccess }: StoryFormProps) {
  const [type, setType] = useState('general');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [posted, setPosted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useMediaUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadFile(files[i]);
        setPhotos((prev) => [...prev, url]);
      } catch {
        setError('Failed to upload photo');
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (url: string) => {
    setPhotos((prev) => prev.filter((p) => p !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.post('/reports', {
        dog_id: dogId,
        type,
        content,
        photo_urls: photos,
      });
      setContent('');
      setPhotos([]);
      setPosted(true);
      setTimeout(() => setPosted(false), 2000);
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
        placeholder="What's new with this dog?"
        required
        rows={3}
      />

      {/* Photo previews */}
      {photos.length > 0 && (
        <div className={styles.photoGrid}>
          {photos.map((url) => (
            <div key={url} className={styles.photoThumb}>
              <img src={url} alt="" className={styles.photoImg} />
              <button
                type="button"
                className={styles.photoRemove}
                onClick={() => removePhoto(url)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <button
        type="button"
        className={styles.uploadBtn}
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <span className={styles.spinner} />
        ) : (
          <>📷 Add photo</>
        )}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp"
        multiple
        className={styles.hiddenInput}
      />

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <Button type="submit" disabled={saving || isUploading || !content.trim()}>
          {posted ? '✓ Posted!' : saving ? 'Posting...' : 'Post Story'}
        </Button>
      </div>
    </form>
  );
}

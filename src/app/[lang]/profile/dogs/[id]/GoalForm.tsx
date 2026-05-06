'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import styles from './GoalForm.module.css';

interface GoalFormProps {
  dogId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { value: 'medical', label: 'Medical', icon: '\u{1F3E5}' },
  { value: 'food', label: 'Food', icon: '\u{1F96B}' },
  { value: 'sterilization', label: 'Sterilization', icon: '\u{2702}\u{FE0F}' },
  { value: 'custom', label: 'Other', icon: '\u{1F4E6}' },
];

export function GoalForm({ dogId, onSuccess, onCancel }: GoalFormProps) {
  const [category, setCategory] = useState('medical');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amountTarget, setAmountTarget] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.post('/goals', {
        dog_id: dogId,
        category,
        title,
        description: description || undefined,
        amount_target: Math.round(parseFloat(amountTarget) * 100),
        is_recurring: isRecurring,
      });
      onSuccess();
    } catch {
      setError('Failed to create goal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.categoryRow}>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            type="button"
            className={`${styles.categoryBtn} ${category === c.value ? styles.categoryActive : ''}`}
            onClick={() => setCategory(c.value)}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Surgery for Rex"
          className={styles.input}
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Explain what the funds are for..."
          className={styles.textarea}
          rows={3}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Target amount (EUR)</label>
          <input
            type="number"
            value={amountTarget}
            onChange={(e) => setAmountTarget(e.target.value)}
            placeholder="e.g. 500"
            className={styles.input}
            required
            min="1"
            step="0.01"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>&nbsp;</label>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
            Monthly recurring
          </label>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving || !title.trim() || !amountTarget}>
          {saving ? 'Creating...' : 'Create Goal'}
        </Button>
      </div>
    </form>
  );
}

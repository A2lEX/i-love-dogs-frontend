'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { useDictionary } from '@/contexts/DictionaryContext';
import styles from './PaymentMethodsSection.module.css';

interface PaymentMethod {
  id: string;
  type: string;
  label: string;
  value: string;
  is_active: boolean;
  sort_order: number;
}

const TYPES = ['paypal', 'iban', 'revolut', 'wise', 'crypto', 'other'] as const;

const TYPE_LABELS: Record<string, string> = {
  paypal: 'PayPal',
  iban: 'IBAN',
  revolut: 'Revolut',
  wise: 'Wise',
  crypto: 'Crypto',
  other: 'Other',
};

const TYPE_ICONS: Record<string, string> = {
  paypal: 'PP',
  iban: 'BK',
  revolut: 'RV',
  wise: 'WS',
  crypto: 'CR',
  other: '$$',
};

export function PaymentMethodsSection() {
  const { dict } = useDictionary();
  const t = dict.paymentMethods || {};

  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);

  // Form state
  const [formType, setFormType] = useState<string>('paypal');
  const [formLabel, setFormLabel] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchMethods = useCallback(async () => {
    try {
      const res = await api.get('/payment-methods/my');
      setMethods(Array.isArray(res.data) ? res.data : []);
      setError('');
    } catch {
      setError('Failed to load payment methods');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  const openAdd = () => {
    setEditing(null);
    setFormType('paypal');
    setFormLabel('');
    setFormValue('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (m: PaymentMethod) => {
    setEditing(m);
    setFormType(m.type);
    setFormLabel(m.label);
    setFormValue(m.value);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSaving(true);
    setFormError('');

    try {
      if (editing) {
        await api.patch(`/payment-methods/${editing.id}`, {
          type: formType,
          label: formLabel,
          value: formValue,
        });
      } else {
        await api.post('/payment-methods', {
          type: formType,
          label: formLabel,
          value: formValue,
        });
      }
      setIsModalOpen(false);
      fetchMethods();
    } catch {
      setFormError(t.error_save || 'Failed to save');
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirm_delete || 'Delete this payment method?')) return;
    try {
      await api.delete(`/payment-methods/${id}`);
      fetchMethods();
    } catch {
      alert(t.error_delete || 'Failed to delete');
    }
  };

  const handleToggle = async (m: PaymentMethod) => {
    try {
      await api.patch(`/payment-methods/${m.id}`, { is_active: !m.is_active });
      fetchMethods();
    } catch {
      alert(t.error_save || 'Failed to update');
    }
  };

  if (isLoading) return <div className={styles.container}>Loading...</div>;
  if (error) return <div className={styles.container}>{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t.title || 'Payment Methods'}</h2>
        <Button onClick={openAdd}>{t.add || 'Add'}</Button>
      </div>

      {methods.length === 0 ? (
        <div className={styles.emptyState}>
          <p>{t.empty || 'No payment methods yet. Add one so donors can send you money directly.'}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {methods.map((m) => (
            <div key={m.id} className={`${styles.item} ${!m.is_active ? styles.inactive : ''}`}>
              <div className={styles.icon} data-type={m.type}>
                {TYPE_ICONS[m.type] || '$$'}
              </div>
              <div className={styles.info}>
                <span className={styles.itemLabel}>{m.label}</span>
                <span className={styles.itemValue}>{m.value}</span>
                <span className={styles.itemType}>{TYPE_LABELS[m.type] || m.type}</span>
              </div>
              <div className={styles.itemActions}>
                <button
                  className={`${styles.toggleBtn} ${m.is_active ? styles.active : ''}`}
                  onClick={() => handleToggle(m)}
                  title={m.is_active ? (t.deactivate || 'Deactivate') : (t.activate || 'Activate')}
                >
                  {m.is_active ? '●' : '○'}
                </button>
                <button className={styles.editBtn} onClick={() => openEdit(m)} title={t.edit || 'Edit'}>
                  ✎
                </button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(m.id)} title={t.delete || 'Delete'}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ResponsiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? (t.edit_title || 'Edit Payment Method') : (t.add_title || 'Add Payment Method')}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t.field_type || 'Type'}</label>
            <select value={formType} onChange={(e) => setFormType(e.target.value)} className={styles.select}>
              {TYPES.map((type) => (
                <option key={type} value={type}>{TYPE_LABELS[type]}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t.field_label || 'Label'}</label>
            <input
              type="text"
              value={formLabel}
              onChange={(e) => setFormLabel(e.target.value)}
              placeholder={t.placeholder_label || 'e.g. PayPal EUR'}
              className={styles.input}
              required
              maxLength={100}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>{t.field_value || 'Account / Address'}</label>
            <input
              type="text"
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
              placeholder={t.placeholder_value || 'e.g. shelter@email.com or IBAN'}
              className={styles.input}
              required
              maxLength={500}
            />
          </div>

          {formError && <div className={styles.formError}>{formError}</div>}

          <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t.cancel || 'Cancel'}
            </Button>
            <Button type="submit" disabled={formSaving}>
              {formSaving ? (t.saving || 'Saving...') : (t.save || 'Save')}
            </Button>
          </div>
        </form>
      </ResponsiveModal>
    </div>
  );
}

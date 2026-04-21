import React, { useState } from 'react';
import { PhotoGalleryEditor } from './PhotoGalleryEditor';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './DogManagementForm.module.css';
import { api } from '@/lib/api';
import { useDictionary } from '@/contexts/DictionaryContext';

export interface DogData {
  id?: string;
  name: string;
  breed: string;
  age_months: number;
  gender: 'male' | 'female' | 'unknown';
  city: string;
  description: string;
  status: 'active' | 'on_hold' | 'medical' | 'adopted' | 'deceased' | 'archived';
  photos: string[];
  cover_photo_url: string;
}

interface DogManagementFormProps {
  initialData?: Partial<DogData>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DogManagementForm({ initialData, onSuccess, onCancel }: DogManagementFormProps) {
  const { dict } = useDictionary();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [breed, setBreed] = useState(initialData?.breed || '');
  const [ageMonths, setAgeMonths] = useState(initialData?.age_months || 12);
  const [gender, setGender] = useState(initialData?.gender || 'male');
  const [city, setCity] = useState(initialData?.city || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState(initialData?.status || 'active');
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);
  const [coverPhoto, setCoverPhoto] = useState(initialData?.cover_photo_url || (photos.length > 0 ? photos[0] : ''));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload: any = {
      name,
      breed,
      age_months: Number(ageMonths),
      gender,
      city,
      description,
      status,
      photos: photos.filter(p => !!p),
    };

    if (coverPhoto) {
      payload.cover_photo_url = coverPhoto;
    }

    try {
      if (initialData?.id) {
        await api.put(`/dogs/${initialData.id}`, payload);
      } else {
        await api.post('/dogs', payload);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Name *</label>
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            placeholder="e.g. Buddy" 
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Breed</label>
          <Input 
            value={breed} 
            onChange={(e) => setBreed(e.target.value)} 
            placeholder="e.g. Mixed" 
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Age (months)</label>
          <Input 
            type="number" 
            value={ageMonths} 
            onChange={(e) => setAgeMonths(Number(e.target.value))} 
            min={0}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Gender</label>
          <select 
            className={styles.select} 
            value={gender} 
            onChange={(e) => setGender(e.target.value as any)}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Status</label>
          <select 
            className={styles.select} 
            value={status} 
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="active">Active (Looking for home)</option>
            <option value="on_hold">On Hold (Foster care)</option>
            <option value="medical">Medical (Under treatment)</option>
            <option value="adopted">Adopted</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>City *</label>
        <Input 
          value={city} 
          onChange={(e) => setCity(e.target.value)} 
          required 
          placeholder="e.g. Moscow" 
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Description *</label>
        <textarea 
          className={styles.textarea} 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
          rows={4}
          placeholder="Describe the dog..."
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Photos</label>
        <PhotoGalleryEditor 
          photos={photos} 
          onChange={setPhotos} 
          coverPhoto={coverPhoto} 
          onCoverChange={setCoverPhoto} 
        />
      </div>

      <div className={styles.actions}>
        <Button type="button" onClick={onCancel} variant="outline" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

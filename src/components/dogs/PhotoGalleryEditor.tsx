'use client';

import React, { useRef } from 'react';
import styles from './PhotoGalleryEditor.module.css';
import { useMediaUpload } from '@/hooks/useMediaUpload';

interface PhotoGalleryEditorProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  coverPhoto: string;
  onCoverChange: (url: string) => void;
}

export function PhotoGalleryEditor({ photos, onChange, coverPhoto, onCoverChange }: PhotoGalleryEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, isUploading } = useMediaUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadFile(files[i]);
        const newPhotos = [...photos, url];
        onChange(newPhotos);
        
        // If it's the first photo, set it as cover automatically
        if (!coverPhoto && newPhotos.length === 1) {
          onCoverChange(url);
        }
      } catch (err) {
        console.error('Error uploading photo', err);
        // Optionally show a toast error
      }
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (urlToRemove: string) => {
    const newPhotos = photos.filter(url => url !== urlToRemove);
    onChange(newPhotos);
    if (coverPhoto === urlToRemove) {
      onCoverChange(newPhotos.length > 0 ? newPhotos[0] : '');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {photos.map((url, index) => (
          <div key={url + index} className={`${styles.photoCard} ${coverPhoto === url ? styles.isCover : ''}`}>
            <img src={url} alt={`Dog photo ${index + 1}`} className={styles.image} />
            <div className={styles.overlay}>
              <button 
                type="button" 
                className={`${styles.starBtn} ${coverPhoto === url ? styles.activeStar : ''}`}
                onClick={() => onCoverChange(url)}
                title="Make cover photo"
              >
                ★
              </button>
              <button 
                type="button" 
                className={styles.deleteBtn}
                onClick={() => removePhoto(url)}
                title="Remove photo"
              >
                ×
              </button>
            </div>
            {coverPhoto === url && <div className={styles.coverBadge}>Cover</div>}
          </div>
        ))}
        
        <button 
          type="button" 
          className={styles.addBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? <span className={styles.spinner}></span> : '+'}
        </button>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/jpeg, image/png, image/webp" 
        multiple 
        className={styles.hiddenInput} 
      />
    </div>
  );
}

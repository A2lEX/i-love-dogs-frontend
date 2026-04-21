import React, { useState } from 'react';
import { useCuratorDogs } from '@/hooks/useCuratorDogs';
import { DogManagementForm, DogData } from '@/components/dogs/DogManagementForm';
import { ResponsiveModal } from '@/components/ui/ResponsiveModal';
import { Button } from '@/components/ui/Button';
import styles from './CuratorDogsSection.module.css';

export function CuratorDogsSection() {
  const { dogs, isLoading, error, refetch } = useCuratorDogs();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDog, setEditingDog] = useState<DogData | undefined>(undefined);

  const openModal = (dog?: DogData) => {
    setEditingDog(dog);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDog(undefined);
  };

  const handleSuccess = () => {
    refetch();
    closeModal();
  };

  if (isLoading) return <div className={styles.container}>Loading dogs...</div>;
  if (error) return <div className={styles.container}>Error loading dogs: {error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Dogs</h2>
        <Button onClick={() => openModal()}>Add Dog</Button>
      </div>

      {dogs.length === 0 ? (
        <div className={styles.emptyState}>
          <p>You haven&apos;t added any dogs yet.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {dogs.map((dog) => (
            <div key={dog.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                {dog.cover_photo_url ? (
                  <img src={dog.cover_photo_url} alt={dog.name} className={styles.image} />
                ) : (
                  <div className={styles.placeholderImage}>No Photo</div>
                )}
                <div className={styles.statusBadge}>{dog.status}</div>
              </div>
              <div className={styles.info}>
                <h3 className={styles.name}>{dog.name}</h3>
                <p className={styles.details}>{dog.breed || 'Mixed'} • {dog.gender}</p>
                <div className={styles.actions}>
                  <Button variant="secondary" onClick={() => openModal(dog)} className={styles.editBtn}>
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ResponsiveModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingDog ? 'Edit Dog' : 'Add New Dog'}
      >
        <DogManagementForm 
          initialData={editingDog} 
          onSuccess={handleSuccess} 
          onCancel={closeModal} 
        />
      </ResponsiveModal>
    </div>
  );
}

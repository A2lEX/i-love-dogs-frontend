import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DogData } from '@/components/dogs/DogManagementForm';

export function useCuratorDogs() {
  const [dogs, setDogs] = useState<DogData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDogs = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/curators/profile');
      setDogs(data.dogs || []);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to load dogs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDogs();
  }, []);

  return { dogs, isLoading, error, refetch: fetchDogs };
}

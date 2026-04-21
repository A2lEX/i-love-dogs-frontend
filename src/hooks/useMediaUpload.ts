import { useState } from 'react';
import { api } from '@/lib/api';

export function useMediaUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      // 1. Get presigned URL
      const response = await api.post('/media/presigned-url', {
        filename: file.name,
        content_type: file.type,
      });
      const data = response.data.data || response.data;

      // 2. Upload directly to S3
      await fetch(data.upload_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      return data.file_url;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading };
}

export interface Dog {
  id: string;
  name: string;
  breed: string;
  age_months: number;
  gender: 'male' | 'female' | 'unknown';
  description: string;
  city: string;
  city_lat?: number;
  city_lng?: number;
  status: 'active' | 'adopted' | 'deceased' | 'archived';
  cover_photo_url: string | null;
  curator_id: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

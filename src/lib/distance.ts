export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Fallback coordinates for known cities in Montenegro
export const FALLBACK_CITY_COORDS: Record<string, {lat: number, lng: number}> = {
  'budva': { lat: 42.2863, lng: 18.8400 },
  'podgorica': { lat: 42.4304, lng: 19.2594 },
  'becici': { lat: 42.2819, lng: 18.8719 },
  'bar': { lat: 42.0932, lng: 19.0984 },
  'kotor': { lat: 42.4246, lng: 18.7712 },
  'tivat': { lat: 42.4364, lng: 18.6961 },
  'herceg novi': { lat: 42.4531, lng: 18.5375 },
};

export function getCityCoords(city: string, dogLat?: number, dogLng?: number): {lat: number, lng: number} | null {
  if (typeof dogLat === 'number' && typeof dogLng === 'number') {
    return { lat: dogLat, lng: dogLng };
  }
  
  const normalizedCity = city.toLowerCase().trim();
  if (FALLBACK_CITY_COORDS[normalizedCity]) {
    return FALLBACK_CITY_COORDS[normalizedCity];
  }
  
  return null;
}

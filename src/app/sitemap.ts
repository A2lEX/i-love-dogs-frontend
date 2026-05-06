import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tailo.org';
const LANGUAGES = ['en', 'ru', 'sr'];

interface Dog {
  id: string;
  updated_at: string;
}

async function getAllDogs(): Promise<Dog[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
    const res = await fetch(`${apiUrl}/dogs?limit=100`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data.items;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dogs = await getAllDogs();

  const staticPages = LANGUAGES.flatMap((lang) => [
    {
      url: `${SITE_URL}/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
      alternates: {
        languages: Object.fromEntries(LANGUAGES.map((l) => [l, `${SITE_URL}/${l}`])),
      },
    },
    {
      url: `${SITE_URL}/${lang}/dogs`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
      alternates: {
        languages: Object.fromEntries(LANGUAGES.map((l) => [l, `${SITE_URL}/${l}/dogs`])),
      },
    },
  ]);

  const dogPages = dogs.flatMap((dog) =>
    LANGUAGES.map((lang) => ({
      url: `${SITE_URL}/${lang}/dogs/${dog.id}`,
      lastModified: new Date(dog.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        languages: Object.fromEntries(LANGUAGES.map((l) => [l, `${SITE_URL}/${l}/dogs/${dog.id}`])),
      },
    }))
  );

  return [...staticPages, ...dogPages];
}

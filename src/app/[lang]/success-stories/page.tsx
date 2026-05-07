import { getDictionary, hasLocale } from '../dictionaries';
import type { Locale } from '../dictionaries';
import { notFound } from 'next/navigation';

export default async function SuccessStoriesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="container" style={{ padding: 'var(--spacing-4xl) 0' }}>
      <h1>{dict.footer.success_stories}</h1>
      <p style={{ marginTop: 'var(--spacing-xl)', fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        Coming soon: inspiring stories of dogs who found their forever homes through Tailo.
      </p>
    </div>
  );
}

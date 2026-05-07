import { getDictionary, hasLocale } from '../dictionaries';
import type { Locale } from '../dictionaries';
import { notFound } from 'next/navigation';
import ContactForm from '@/components/layout/ContactForm';

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang as Locale);

  return (
    <div className="container" style={{ padding: 'var(--spacing-4xl) 0' }}>
      <h1>{dict.footer.about}</h1>
      <p style={{ marginTop: 'var(--spacing-xl)', fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
        Tailo is a platform dedicated to helping shelter dogs in Montenegro. 
        We connect people who want to help with dogs that need it most.
      </p>

      <ContactForm />
    </div>
  );
}

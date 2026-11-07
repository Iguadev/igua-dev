import { languagePath } from '@/lib/i18n/routing';
import { getI18n } from '@/lib/i18n/server';
import { localizeMetadata } from '@/lib/seo';
import Link from '@/components/localized-link';
import { PageIntro, EmptyState, EventCards } from '@/components/sections';
import { events } from '@/lib/data';
const pageMetadata = {
  title: 'Encuentros y eventos',
  description:
    'Encuentros, talleres y espacios para construir tecnología en Puerto Iguazú. Explorá la agenda de IGUA.DEV.',
  alternates: { canonical: '/events' },
};
export async function generateMetadata() {
  const { language } = await getI18n();
  return localizeMetadata(pageMetadata, language);
}
export default async function Events({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; category?: string }>;
}) {
  const { t, language } = await getI18n();
  const query = await searchParams;
  const all = await events();
  const past = query.view === 'past';
  const categories = [...new Set(all.map((e) => e.category))];
  const selected = all.filter(
    (e) =>
      (past
        ? e.status === 'completed' || new Date(e.ends_at) <= new Date()
        : e.status === 'published' && new Date(e.ends_at) > new Date()) &&
      (!query.category || e.category === query.category),
  );
  return (
    <div className="container page-content">
      <PageIntro
        label={t('Nos encontramos para hacer')}
        title={t('Buenas conversaciones. Mejores conexiones.')}
      >
        <p>
          {t(
            'Talleres, meetups y sesiones de construcción. Un espacio para pasar de “tengo una idea” a “mirá lo que hicimos”.',
          )}
        </p>
      </PageIntro>
      <nav className="filter-bar" aria-label={t('Filtrar eventos')}>
        <Link
          className={`filter ${!past ? 'active' : ''}`}
          href={languagePath(language, '/events')}
        >
          {t('Próximos encuentros')}
        </Link>
        <Link
          className={`filter ${past ? 'active' : ''}`}
          href={languagePath(language, '/events?view=past')}
        >
          {t('Encuentros anteriores')}
        </Link>
        {categories.map((category) => (
          <Link
            className={`filter ${category === query.category ? 'active' : ''}`}
            key={category}
            href={`/events?view=${past ? 'past' : 'upcoming'}&category=${encodeURIComponent(category)}`}
          >
            {category}
          </Link>
        ))}
      </nav>
      {selected.length ? (
        <EventCards events={selected} />
      ) : past ? (
        <div className="info-panel">
          <h2>{t('La historia está por empezar.')}</h2>
          <p>
            {t(
              'Acá vas a encontrar los encuentros anteriores, sus recursos y lo que aprendimos juntos.',
            )}
          </p>
          <Link href={languagePath(language, '/events')} className="text-link">
            {t('Ver próximos encuentros')}
          </Link>
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

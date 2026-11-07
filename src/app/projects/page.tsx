import { getI18n } from '@/lib/i18n/server';
import { localizeMetadata } from '@/lib/seo';
import { PageIntro, EmptyState, ProjectCards } from '@/components/sections';
import { projects } from '@/lib/data';
const pageMetadata = {
  title: 'Proyectos de la comunidad',
  description: 'Ideas, experimentos y productos hechos por la comunidad IGUA.DEV.',
  alternates: { canonical: '/projects' },
};
export async function generateMetadata() {
  const { language } = await getI18n();
  return localizeMetadata(pageMetadata, language);
}
export default async function Projects() {
  const { t, language } = await getI18n();
  const all = await projects();
  return (
    <div className="container page-content">
      <PageIntro label={t('Construido entre nosotros')} title={t('De una idea a algo que existe.')}>
        <p>
          {t(
            'Un espacio para mostrar lo que hacemos, compartir aprendizajes y encontrar a la próxima persona con quien construir.',
          )}
        </p>
      </PageIntro>
      {all.length ? <ProjectCards projects={all} /> : <EmptyState kind="projects" />}
    </div>
  );
}

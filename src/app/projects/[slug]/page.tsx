import { getI18n } from '@/lib/i18n/server';
import { localizeMetadata } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { db } from '@/lib/supabase/server';
import { PageIntro } from '@/components/sections';
import { Button } from '@/components/ui/button';
async function getProject(slug: string) {
  const client = await db();
  if (!client) return null;
  const { data, error } = await client
    .from('projects')
    .select('*,project_technologies(name)')
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('visibility', 'public')
    .maybeSingle();
  if (error) throw new Error('Could not load project');
  return data;
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { t, language } = await getI18n();
  const { slug } = await params;
  const project = await getProject(slug);
  return localizeMetadata(
    {
      title: project?.title || t('Proyecto no encontrado'),
      description: project?.description.slice(0, 160),
      alternates: { canonical: `/projects/${slug}` },
    },
    language,
  );
}
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { t, language } = await getI18n();
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  return (
    <div className="container page-content">
      <PageIntro label={t('Hecho por la comunidad')} title={project.title} />
      <div className="two-column">
        <div className="prose">
          {language === 'en' && (
            <p className="notice">
              Project details are shared by their creators in the original language.
            </p>
          )}
          <p>{project.description}</p>
        </div>
        <aside className="info-panel">
          <h2>{t('Explorá el proyecto.')}</h2>
          <div className="tags">
            {project.project_technologies.map((t: { name: string }) => (
              <span className="badge" key={t.name}>
                {t.name}
              </span>
            ))}
          </div>
          <div className="stack">
            {project.github_url && (
              <Button variant="secondary" asChild>
                <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                  {t('Ver repositorio')}
                </a>
              </Button>
            )}
            {project.demo_url && (
              <Button asChild>
                <a href={project.demo_url} target="_blank" rel="noopener noreferrer">
                  {t('Probar el proyecto')}
                </a>
              </Button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

import { getI18n } from '@/lib/i18n/server';
import { languagePath, pick } from '@/lib/i18n/routing';
import { JsonLd } from '@/components/json-ld';
import { itemListEntities, localizeMetadata } from '@/lib/seo';
import {
  ArrowUpRight,
  BookOpen,
  Search,
  Terminal,
  Blocks,
  CloudUpload,
  GitBranch,
  Network,
  ShieldCheck,
} from 'lucide-react';
import { PageIntro } from '@/components/sections';
import { Button } from '@/components/ui/button';
import {
  findResources,
  resourceCategories,
  resources,
  type ResourceCategory,
} from '@/features/resources/catalog';

const pageMetadata = {
  title: 'Recursos para aprender y construir',
  description:
    'Tutoriales, guías y documentación de Codex, Cursor, Claude Code, skills.sh, Vercel, GitHub y Stellar. Una biblioteca de referencias para la comunidad IGUA.DEV.',
  alternates: { canonical: '/recursos' },
};
export async function generateMetadata() {
  const { language } = await getI18n();
  return localizeMetadata(pageMetadata, language);
}
const icons = {
  ai: Terminal,
  agents: Blocks,
  deploy: CloudUpload,
  git: GitBranch,
  blockchain: Network,
  security: ShieldCheck,
} satisfies Record<ResourceCategory, typeof Terminal>;
function filterUrl(category: string, query: string) {
  const params = new URLSearchParams();
  if (category !== 'all') params.set('tema', category);
  if (query) params.set('q', query);
  return `/recursos${params.size ? `?${params}` : ''}`;
}

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; tema?: string | string[] }>;
}) {
  const [{ t, language }, params] = await Promise.all([getI18n(), searchParams]);
  const query = typeof params.q === 'string' ? params.q.trim().slice(0, 100) : '';
  const category = resourceCategories.find((item) => item.id === params.tema)?.id ?? 'all';
  const selected = findResources(query, category, t, language);
  const filtered = !!query || category !== 'all';

  return (
    <div className="container page-content resources-page">
      <JsonLd
        data={itemListEntities(
          language,
          '/recursos',
          t('Recursos para aprender y construir'),
          selected.map((resource) => ({ name: t(resource.title), url: resource.url })),
        )}
      />
      <PageIntro
        label={t('La curiosidad necesita buenos enlaces')}
        title={t('Una biblioteca para construir.')}
      >
        <p>
          {t(
            'Guías, tutoriales y documentación para pasar de la pregunta al proyecto. Referencias que vale la pena tener a mano, elegidas para la comunidad.',
          )}
        </p>
      </PageIntro>

      <div className="resources-layout">
        <aside className="resources-sidebar">
          <div className="resources-sidebar-heading">
            <BookOpen size={19} strokeWidth={1.5} />
            <h2>{t('Explorá por tema')}</h2>
          </div>
          <nav aria-label={t('Temas de recursos')} className="resources-topics">
            {resourceCategories.map((item) => (
              <a
                key={item.id}
                href={languagePath(language, filterUrl(item.id, query))}
                aria-current={category === item.id ? 'page' : undefined}
              >
                <span>{t(item.label)}</span>
                <span className="resource-topic-count">
                  {item.id === 'all'
                    ? resources.length
                    : resources.filter((r) => r.category === item.id).length}
                </span>
              </a>
            ))}
          </nav>
          <div className="resources-reading-note">
            <span className="small-label">{t('A tu ritmo')}</span>
            <p>
              {t(
                'No necesitás aprender todo a la vez. Elegí una herramienta, probá algo pequeño y volvé cuando aparezca la próxima pregunta.',
              )}
            </p>
          </div>
        </aside>

        <section className="resources-library" aria-labelledby="resource-results-title">
          <form
            className="resource-search"
            action={languagePath(language, '/recursos')}
            method="get"
            role="search"
          >
            {category !== 'all' && <input type="hidden" name="tema" value={category} />}
            <label className="sr-only" htmlFor="resource-query">
              {t('Buscar recursos')}
            </label>
            <div className="resource-search-field">
              <Search size={18} aria-hidden="true" />
              <input
                id="resource-query"
                name="q"
                type="search"
                defaultValue={query}
                maxLength={100}
                placeholder={t('Codex, Git, seguridad…')}
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              {t('Buscar')}
            </Button>
          </form>
          <div className="resources-results-heading">
            <h2 id="resource-results-title">
              {filtered ? t('Tu selección') : t('Buenos puntos de partida')}
            </h2>
            <p role="status">
              {selected.length}{' '}
              {pick(language, {
                es: selected.length === 1 ? 'recurso' : 'recursos',
                pt: selected.length === 1 ? 'recurso' : 'recursos',
                en: selected.length === 1 ? 'resource' : 'resources',
              })}
            </p>
          </div>
          {selected.length ? (
            <div className="resources-list">
              {selected.map((resource) => {
                const Icon = icons[resource.category];
                const topic = resourceCategories.find((item) => item.id === resource.category)!;
                return (
                  <article
                    key={resource.id}
                    className={`resource-item resource-${resource.category}`}
                  >
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-resource-id={resource.id}
                    >
                      <div className="resource-item-top">
                        <span className="resource-icon">
                          <Icon size={22} strokeWidth={1.5} />
                        </span>
                        <span className="resource-topic">{t(topic.label)}</span>
                        <ArrowUpRight size={18} className="resource-external" aria-hidden="true" />
                      </div>
                      <div className="resource-provider">{resource.provider}</div>
                      <h3>{t(resource.title)}</h3>
                      <p>{t(resource.description)}</p>
                      <div className="resource-meta">
                        <span>{t(resource.format)}</span>
                        <span>{t(resource.language)}</span>
                      </div>
                      <span className="sr-only">{t('Abrir recurso en una pestaña nueva.')}</span>
                    </a>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="resources-empty">
              <Search size={28} strokeWidth={1.4} />
              <h3>{t('No encontramos ese punto de partida.')}</h3>
              <p>
                {t(
                  'Probá con otra palabra o explorá todos los temas. La biblioteca va a seguir creciendo.',
                )}
              </p>
              <Button asChild variant="secondary">
                <a href={languagePath(language, '/recursos')}>{t('Ver todos los recursos')}</a>
              </Button>
            </div>
          )}
          {filtered && selected.length > 0 && (
            <a href={languagePath(language, '/recursos')} className="text-link resources-reset">
              {t('Limpiar búsqueda y filtros')}
            </a>
          )}
          <div className="resources-source-note">
            <p>
              {t(
                'Los enlaces llevan a sitios externos y no implican una alianza con IGUA.DEV. Priorizamos las fuentes de quienes crean las herramientas.',
              )}
            </p>
            <span>{t('Enlaces revisados el 7 de noviembre de 2026.')}</span>
          </div>
        </section>
      </div>
    </div>
  );
}

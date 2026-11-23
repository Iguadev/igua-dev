import { languagePath } from '@/lib/i18n/routing';
import { getI18n } from '@/lib/i18n/server';
import { localizeMetadata } from '@/lib/seo';
import Link from '@/components/localized-link';
import { ArrowDown, ArrowUpRight, BookOpen, Code2, MessagesSquare, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Confluence } from '@/components/confluence';
import { FrontierMap } from '@/components/frontier-map';
import {
  ClosingCTA,
  EmptyState,
  EventCards,
  ProgramCards,
  ProjectCards,
} from '@/components/sections';
import { events, projects, programs, partners, content } from '@/lib/data';
const pageMetadata = {
  title: 'El futuro también se construye desde acá.',
  description:
    'Código, comunidad y oportunidades. Una comunidad abierta de developers, creadores y personas curiosas por la tecnología en Puerto Iguazú, Misiones.',
  alternates: { canonical: '/' },
};
export async function generateMetadata() {
  const { language } = await getI18n();
  return localizeMetadata(pageMetadata, language);
}
export default async function Home() {
  const { t, language } = await getI18n();
  const [allEvents, allProjects, allPrograms, allPartners, originContent] = await Promise.all([
    events(),
    projects(),
    programs(),
    partners(),
    content('origin'),
  ]);
  const upcoming = allEvents
    .filter((e) => e.status === 'published' && new Date(e.ends_at) > new Date())
    .slice(0, 3);
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="location-tag">
              <span className="status-dot" />
              Puerto Iguazú, Misiones <span className="location-dash" /> Argentina
            </div>
            <h1>
              {t('El futuro también')}
              <br className="desktop-break" />
              {' ' + t('se construye')}
              <br className="desktop-break" />
              {' ' + t('desde acá')}
              <span className="headline-dot">.</span>
            </h1>
            <p>
              {t(
                'Una comunidad de developers, creadores y personas curiosas por la tecnología. Desde Puerto Iguazú, conectados con el mundo.',
              )}
            </p>
            <div className="hero-buttons">
              <Button asChild>
                <Link href={languagePath(language, '/join')}>
                  {t('Unirme a IGUA.DEV') + ' '}
                  <ArrowUpRight size={18} />
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href={languagePath(language, '/events')}>
                  {t('Explorar eventos') + ' '}
                  <ArrowUpRight size={17} />
                </Link>
              </Button>
            </div>
            <div className="hero-note">
              <span>{t('La comunidad es abierta. Las posibilidades, también.')}</span>
            </div>
          </div>
          <Confluence />
        </div>
        <div className="container hero-bottom">
          <span>{t('Un lugar para quienes hacen.')}</span>
          <a href="#hacemos" aria-label={t('Descubrí qué hacemos')}>
            <ArrowDown size={16} />
            <span>{t('Seguí explorando')}</span>
          </a>
          <span className="mono">Built in Iguazú ↗</span>
        </div>
      </section>
      <section className="section activities" id="hacemos">
        <div className="container">
          <div className="section-heading">
            <h2>
              {t('Las mejores ideas')}
              <br />
              {t('se construyen en comunidad.')}
            </h2>
            <p>
              {t('Nos une la curiosidad.')}
              <br />
              {t('Nos mueve hacer cosas con ella.')}
            </p>
          </div>
          <div className="activity-grid">
            {[
              {
                icon: BookOpen,
                title: t('Aprender'),
                text: t(
                  'De tu primer “hola mundo” a tu próximo desafío. Siempre hay algo por descubrir.',
                ),
              },
              {
                icon: Code2,
                title: t('Construir'),
                text: t(
                  'Menos ideas en un cajón. Más proyectos en el mundo. Probamos, creamos e iteramos.',
                ),
              },
              {
                icon: Network,
                title: t('Conectar'),
                text: t(
                  'Encontrá a quienes comparten tus ganas de hacer. Las conexiones abren caminos.',
                ),
              },
              {
                icon: MessagesSquare,
                title: t('Compartir'),
                text: t(
                  'Lo que sabés puede ser el comienzo de alguien más. El conocimiento crece cuando circula.',
                ),
              },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <Icon size={24} strokeWidth={1.5} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="small-label">{t('Nos vemos pronto')}</span>
              <h2>{t('Del chat al encuentro.')}</h2>
            </div>
            <Link className="text-link" href={languagePath(language, '/events')}>
              {t('Todos los eventos') + ' '}
              <ArrowUpRight size={17} />
            </Link>
          </div>
          {upcoming.length ? <EventCards events={upcoming} /> : <EmptyState />}
        </div>
      </section>
      <section className="origin-section">
        <div className="container origin-grid">
          <div className="origin-copy">
            <span className="small-label">Built in Iguazú</span>
            <h2>{originContent?.title || t('No hace falta irse lejos para llegar lejos.')}</h2>
            <p>
              {originContent?.body ||
                t(
                  'Nacemos en Puerto Iguazú, en un lugar donde se encuentran países, culturas e ideas. Creemos que el talento de acá merece un espacio para encontrarse y crecer.',
                )}
            </p>
            <p>
              {t(
                'Queremos construir ese espacio. Para aprender juntos, crear tecnología útil y abrir caminos desde nuestra ciudad hacia el mundo.',
              )}
            </p>
            <Link href={languagePath(language, '/about')} className="text-link">
              {t('Conocé nuestra historia') + ' '}
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <FrontierMap language={language} />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="small-label">{t('Muchas formas de crear')}</span>
              <h2>{t('Tu curiosidad tiene lugar.')}</h2>
            </div>
            <Link href={languagePath(language, '/programs')} className="text-link">
              {t('Explorar programas') + ' '}
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <ProgramCards programs={allPrograms} preview />
        </div>
      </section>
      <section className="section projects-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="small-label">{t('Ideas que salen al mundo')}</span>
              <h2>{t('Hecho por la comunidad.')}</h2>
            </div>
            <Link href={languagePath(language, '/projects')} className="text-link">
              {t('Ver proyectos') + ' '}
              <ArrowUpRight size={17} />
            </Link>
          </div>
          {allProjects.length ? (
            <ProjectCards projects={allProjects.slice(0, 3)} />
          ) : (
            <EmptyState kind="projects" compact />
          )}
        </div>
      </section>
      <section className="section partners-strip">
        <div className="container">
          <div>
            <span className="small-label">{t('El ecosistema lo hacemos juntos')}</span>
            <h2>{t('Construyamos más oportunidades.')}</h2>
          </div>
          {allPartners.length ? (
            <div className="partner-names">
              {allPartners.map((p) => (
                <span key={p.id}>{p.name}</span>
              ))}
            </div>
          ) : (
            <p>{t('Estamos abiertos a nuevas alianzas que hagan crecer el talento local.')}</p>
          )}
          <Link href={languagePath(language, '/partners')} className="text-link">
            {t('Ser parte como aliado') + ' '}
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <ClosingCTA />
    </>
  );
}

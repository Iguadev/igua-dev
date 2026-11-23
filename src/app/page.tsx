import { languagePath, pick } from '@/lib/i18n/routing';
import { getI18n } from '@/lib/i18n/server';
import { localizeMetadata } from '@/lib/seo';
import Link from '@/components/localized-link';
import { ArrowRight, ArrowUpRight, BookOpen, Code2, MessagesSquare, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HeroVideo } from '@/components/hero-video';
import { HeroMark } from '@/components/hero-mark';
import { MarkerWord } from '@/components/marker-word';
import { TopicRibbon } from '@/components/topic-ribbon';
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
  const pillars = [
    {
      icon: BookOpen,
      title: t('Aprender'),
      text: t('De tu primer “hola mundo” a tu próximo desafío. Siempre hay algo por descubrir.'),
    },
    {
      icon: Code2,
      title: t('Construir'),
      text: t('Menos ideas en un cajón. Más proyectos en el mundo. Probamos, creamos e iteramos.'),
    },
    {
      icon: Network,
      title: t('Conectar'),
      text: t('Encontrá a quienes comparten tus ganas de hacer. Las conexiones abren caminos.'),
    },
    {
      icon: MessagesSquare,
      title: t('Compartir'),
      text: t(
        'Lo que sabés puede ser el comienzo de alguien más. El conocimiento crece cuando circula.',
      ),
    },
  ];
  return (
    <>
      <section className="hero">
        <HeroVideo />
        <div className="container hero-grid">
          <div className="hero-copy">
            <h1>
              <span className="hero-line">
                <HeroMark
                  text={t('El futuro también')}
                  word={pick(language, { es: 'futuro', pt: 'futuro', en: 'future' })}
                />
              </span>{' '}
              <span className="hero-line">
                <HeroMark
                  text={t('se construye')}
                  word={pick(language, { es: 'construye', pt: 'constrói', en: 'built' })}
                  underline
                />
              </span>{' '}
              <span className="hero-line">{`${t('desde acá')}.`}</span>
            </h1>
            <p>
              {t(
                'Una comunidad de developers, creadores y personas curiosas por la tecnología. Desde Puerto Iguazú, conectados con el mundo.',
              )}
            </p>
            <div className="hero-buttons">
              <Button asChild>
                <Link href={languagePath(language, '/join')}>
                  {t('Unirme a IGUA.DEV')}
                  <ArrowUpRight size={18} />
                </Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href={languagePath(language, '/events')}>
                  {t('Explorar eventos')}
                  <ArrowRight size={18} />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <TopicRibbon language={language} />
      <section className="section pillars" id="hacemos">
        <div className="container">
          <div className="pillars-head">
            <h2 className="display-title">
              {t('Las mejores ideas')}
              <br />
              <MarkerWord
                text={t('se construyen en comunidad.')}
                word={pick(language, { es: 'comunidad', pt: 'comunidade', en: 'together' })}
              />
            </h2>
            <p>
              {t('Nos une la curiosidad.')} {t('Nos mueve hacer cosas con ella.')}
            </p>
          </div>
          <ul className="pillar-list">
            {pillars.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="pillar-icon">
                  <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <h2>{t('Del chat al encuentro.')}</h2>
            <Link className="text-link" href={languagePath(language, '/events')}>
              {t('Todos los eventos') + ' '}
              <ArrowUpRight size={17} />
            </Link>
          </div>
          {upcoming.length ? <EventCards events={upcoming} /> : <EmptyState />}
        </div>
      </section>
      <section className="origin-section" data-nav-tone="earth">
        <div className="container origin-grid">
          <div className="origin-copy">
            <h2>
              <MarkerWord
                text={originContent?.title || t('No hace falta irse lejos para llegar lejos.')}
                word={pick(language, { es: 'llegar lejos', pt: 'ir longe', en: 'go far' })}
              />
            </h2>
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
            <h2>{t('Tu curiosidad tiene lugar.')}</h2>
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
            <h2>{t('Hecho por la comunidad.')}</h2>
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
      <section className="partners-strip">
        <div className="container">
          <h2>{t('Construyamos más oportunidades.')}</h2>
          {allPartners.length ? (
            <div className="partner-names">
              {allPartners.map((p) => (
                <span key={p.id}>{p.name}</span>
              ))}
            </div>
          ) : (
            <p>{t('Estamos abiertos a nuevas alianzas que hagan crecer el talento local.')}</p>
          )}
          <Button variant="outline" asChild>
            <Link href={languagePath(language, '/partners')}>
              {t('Ser parte como aliado')}
              <ArrowUpRight size={17} />
            </Link>
          </Button>
        </div>
      </section>
      <ClosingCTA />
    </>
  );
}

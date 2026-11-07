import { getI18n } from '@/lib/i18n/server';
import Link from '@/components/localized-link';
import {
  ArrowUpRight,
  CalendarDays,
  Code2,
  Cpu,
  GitBranch,
  Lightbulb,
  MapPin,
  MoveUpRight,
} from 'lucide-react';
import { Button } from './ui/button';
import type { Event, Program, Project } from '@/lib/data';
import { eventDate } from '@/lib/utils';
export function PageIntro({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-intro">
      <div className="eyebrow">
        <span className="tiny-cross">+</span>
        {label}
      </div>
      <h1>{title}</h1>
      {children && <div className="intro-copy">{children}</div>}
    </div>
  );
}
export async function EmptyState({
  kind = 'events',
  compact = false,
}: {
  kind?: 'events' | 'projects' | 'partners';
  compact?: boolean;
}) {
  const { t, language } = await getI18n();
  const items = {
    events: {
      icon: CalendarDays,
      title: t('El próximo encuentro empieza con vos.'),
      body: t(
        'Estamos preparando los primeros encuentros de IGUA.DEV. Sumate a la comunidad y elegí recibir las novedades cuando abramos inscripciones.',
      ),
      cta: t('Quiero ser parte'),
      href: '/join',
      label: t('Próximamente, en Iguazú'),
    },
    projects: {
      icon: GitBranch,
      title: t('El primer commit puede ser tuyo.'),
      body: t(
        'Este espacio está listo para las primeras ideas de la comunidad. Compartí lo que estás construyendo y encontrá personas para hacerlo crecer.',
      ),
      cta: t('Compartir mi proyecto'),
      href: '/dashboard/projects',
      label: t('Un espacio para construir'),
    },
    partners: {
      icon: Lightbulb,
      title: t('Las buenas ideas crecen acompañadas.'),
      body: t(
        'Buscamos personas y organizaciones que quieran abrir oportunidades para el talento local. Conversemos sobre cómo colaborar.',
      ),
      cta: t('Quiero colaborar'),
      href: '/partners#colaborar',
      label: t('Alianzas por construir'),
    },
  }[kind];
  const Icon = items.icon;
  return (
    <div className={`empty-state ${compact ? 'compact' : ''}`}>
      <div className="empty-art" aria-hidden="true">
        <span />
        <Icon size={38} strokeWidth={1} />
        <span />
      </div>
      <div className="empty-copy">
        <span className="small-label">{items.label}</span>
        <h3>{items.title}</h3>
        <p>{items.body}</p>
        <Button variant="secondary" asChild>
          <Link href={items.href}>
            {items.cta}
            <ArrowUpRight size={16} />
          </Link>
        </Button>
      </div>
      <span className="empty-corner" aria-hidden="true">
        +
      </span>
    </div>
  );
}
export async function EventCards({ events }: { events: Event[] }) {
  const { t, language } = await getI18n();
  return (
    <div className="event-grid">
      {events.map((event) => (
        <Link className="event-card" key={event.id} href={`/events/${event.slug}`}>
          <div className="event-art">
            <CalendarDays size={45} strokeWidth={1} />
            <span>{event.category}</span>
          </div>
          <div className="event-card-body">
            <span className="small-label">
              {event.status === 'cancelled'
                ? t('Cancelado')
                : event.status === 'completed'
                  ? t('Finalizado')
                  : event.registration_status === 'open'
                    ? t('Inscripciones abiertas')
                    : t('Inscripciones cerradas')}
            </span>
            <h3>{event.title}</h3>
            <p>
              <CalendarDays size={15} />
              {eventDate(event.starts_at, event.time_zone, language === 'en' ? 'en' : 'es-AR')}
            </p>
            <p>
              <MapPin size={15} />
              {event.venues?.name ?? t('Lugar a confirmar')}
            </p>
            <span className="text-link">
              {t('Ver encuentro') + ' '}
              <ArrowUpRight size={16} />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
const programIcons = [Code2, Cpu, GitBranch, Lightbulb];
export async function ProgramCards({
  programs,
  preview = false,
}: {
  programs: Program[];
  preview?: boolean;
}) {
  const { t, language } = await getI18n();
  return (
    <div className={`program-grid ${preview ? 'preview' : ''}`}>
      {programs.map((program, i) => {
        const Icon = programIcons[i % 4];
        return (
          <article
            className={`program-card accent-${program.accent}`}
            key={program.id}
            id={program.slug}
          >
            <div className="program-top">
              <div className="program-mark">
                <Icon size={27} strokeWidth={1.4} />
              </div>
              <span className="program-status">
                {program.status === 'active' ? t('Activo') : t('En preparación')}
              </span>
            </div>
            <h3>{t(program.title)}</h3>
            <p>{t(program.description)}</p>
            {preview ? (
              <Link
                href={`/programs#${program.slug}`}
                aria-label={`${t('Conocé')} ${t(program.title)}`}
                className="program-link"
              >
                <MoveUpRight size={19} />
              </Link>
            ) : (
              <Link href="/join" className="text-link">
                {t('Me interesa') + ' '}
                <ArrowUpRight size={15} />
              </Link>
            )}
          </article>
        );
      })}
    </div>
  );
}
export async function ProjectCards({ projects }: { projects: Project[] }) {
  const { t, language } = await getI18n();
  return (
    <div className="project-grid">
      {projects.map((project) => (
        <Link key={project.id} href={`/projects/${project.slug}`} className="project-card">
          <Code2 size={30} />
          <h3>{project.title}</h3>
          <p>{project.description.slice(0, 180)}</p>
          <span className="text-link">
            {t('Conocer proyecto') + ' '}
            <ArrowUpRight size={16} />
          </span>
        </Link>
      ))}
    </div>
  );
}
export async function ClosingCTA() {
  const { t, language } = await getI18n();
  return (
    <section className="closing">
      <div className="container closing-inner">
        <div>
          <span className="small-label">{t('Hay lugar para vos.')}</span>
          <h2>
            {t('Tu próximo proyecto.')}
            <br />
            {t('Tu próxima comunidad.')}
          </h2>
          <p>{t('No necesitás saberlo todo. Con tener ganas de empezar, alcanza.')}</p>
        </div>
        <div>
          <Button asChild>
            <Link href="/join">
              {t('Unirme a IGUA.DEV')}
              <ArrowUpRight size={18} />
            </Link>
          </Button>
          <span className="free-note">{t('Gratis. Abierta. Hecha entre todos.')}</span>
        </div>
      </div>
    </section>
  );
}

import { languagePath, pick } from '@/lib/i18n/routing';
import { getI18n } from '@/lib/i18n/server';
import Link from '@/components/localized-link';
import { requireMember } from '@/features/auth/guards';
import { PageIntro } from '@/components/sections';
import { Button } from '@/components/ui/button';
export default async function Dashboard() {
  const { t, language } = await getI18n();
  const member = await requireMember();
  const [registrations, projects] = await Promise.all([
    member.client
      .from('event_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('member_id', member.user.id)
      .neq('status', 'cancelled'),
    member.client
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', member.user.id),
  ]);
  if (registrations.error || projects.error) throw new Error('Could not load dashboard');
  return (
    <>
      <PageIntro
        label={t('Tu comunidad')}
        title={`${pick(language, { es: 'Hola', pt: 'Olá', en: 'Hello' })}${member.profile?.display_name ? `, ${member.profile.display_name}` : ''}.`}
      >
        <p>{t('Este es tu espacio para encontrarte, aprender y construir.')}</p>
      </PageIntro>
      {!member.profile?.onboarded && (
        <div className="info-panel" style={{ marginBottom: 25 }}>
          <h2>{t('Empecemos por conocernos.')}</h2>
          <p>
            {t(
              'Completá tu perfil para inscribirte a eventos y compartir proyectos. Lleva unos minutos.',
            )}
          </p>
          <Button asChild>
            <Link href={languagePath(language, '/dashboard/profile')}>
              {t('Completar mi perfil')}
            </Link>
          </Button>
        </div>
      )}
      <div className="metrics">
        <div className="metric">
          <strong>{registrations.count ?? 0}</strong>
          <span>{t('Inscripciones activas')}</span>
        </div>
        <div className="metric">
          <strong>{projects.count ?? 0}</strong>
          <span>{t('Proyectos propios')}</span>
        </div>
      </div>
      <div className="stack">
        <Link className="text-link" href={languagePath(language, '/events')}>
          {t('Explorar encuentros ↗')}
        </Link>
        <Link className="text-link" href={languagePath(language, '/dashboard/projects')}>
          {t('Compartir un proyecto ↗')}
        </Link>
        {member.roles.some((r) => ['organizer', 'admin'].includes(r)) && (
          <Link className="text-link" href={languagePath(language, '/admin')}>
            {t('Administrar la comunidad ↗')}
          </Link>
        )}
      </div>
    </>
  );
}

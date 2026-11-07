import { getI18n } from '@/lib/i18n/server';
import { requireStaff } from '@/features/auth/guards';
import { PageIntro } from '@/components/sections';
export default async function Admin() {
  const { t, language } = await getI18n();
  const member = await requireStaff();
  const admin = member.roles.includes('admin');
  const definitions = [
    ...(admin ? [[t('Integrantes'), 'profiles', null, null]] : []),
    [t('Próximos eventos'), 'events', 'status', 'published'],
    [t('Inscripciones'), 'event_registrations', null, null],
    [t('Asistencias'), 'event_registrations', 'attended_at', 'not-null'],
    ...(admin
      ? [
          [t('Proyectos publicados'), 'projects', 'status', 'published'],
          [t('Proyectos pendientes'), 'projects', 'status', 'pending'],
          [t('Consultas de colaboración'), 'partnership_inquiries', null, null],
        ]
      : []),
  ];
  const metrics = await Promise.all(
    definitions.map(async ([label, table, column, value]) => {
      let q = member.client.from(table!).select('id', { count: 'exact', head: true });
      if (column && value)
        q = value === 'not-null' ? q.not(column, 'is', null) : q.eq(column, value);
      if (table === 'events') q = q.gte('starts_at', new Date().toISOString());
      if (label === t('Proyectos publicados')) q = q.eq('visibility', 'public');
      if (label === t('Inscripciones')) q = q.neq('status', 'cancelled');
      const { count, error } = await q;
      if (error) throw new Error('Could not load admin metrics');
      return { label, count };
    }),
  );
  return (
    <>
      <PageIntro label={t('Organización')} title={t('La comunidad, en perspectiva.')}>
        <p>
          {t(
            'Datos actuales de la plataforma. Los permisos de tu rol determinan qué información podés ver.',
          )}
        </p>
      </PageIntro>
      <div className="metrics">
        {metrics.map((m) => (
          <div className="metric" key={m.label}>
            <strong>{m.count ?? 0}</strong>
            <span>{m.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

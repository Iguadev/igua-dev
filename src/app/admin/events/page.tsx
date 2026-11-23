import { languagePath, languageTags } from '@/lib/i18n/routing';
import { getI18n } from '@/lib/i18n/server';
import Link from '@/components/localized-link';
import { requireStaff } from '@/features/auth/guards';
import { PageIntro } from '@/components/sections';
import { Button } from '@/components/ui/button';
import { ActionForm, Field } from '@/components/action-form';
import { staffMutation } from '@/features/admin/actions';
import { eventDate } from '@/lib/utils';
export default async function AdminEvents({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { t, language } = await getI18n();
  const member = await requireStaff();
  const { status } = await searchParams;
  let q = member.client
    .from('events')
    .select('id,title,status,starts_at,registration_status')
    .order('starts_at', { ascending: false });
  if (status && ['draft', 'published', 'completed', 'cancelled'].includes(status))
    q = q.eq('status', status);
  const { data, error } = await q;
  if (error) throw new Error('Could not load events');
  return (
    <>
      <PageIntro label={t('Agenda de la comunidad')} title={t('Eventos.')} />
      <div className="toolbar">
        <div className="filter-bar">
          {[
            ['', t('Todos')],
            ['draft', t('Borradores')],
            ['published', t('Publicados')],
            ['completed', t('Finalizados')],
            ['cancelled', t('Cancelados')],
          ].map(([key, label]) => (
            <Link
              key={key}
              className={`filter ${(!status && !key) || status === key ? 'active' : ''}`}
              href={`/admin/events${key ? `?status=${key}` : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>
        <Button asChild>
          <Link href={languagePath(language, '/admin/events/new')}>{t('Crear evento')}</Link>
        </Button>
      </div>
      {data.length ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('Evento')}</th>
                <th>{t('Fecha')}</th>
                <th>{t('Estado')}</th>
                <th>{t('Gestión')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((e) => (
                <tr key={e.id}>
                  <td>{e.title}</td>
                  <td>{eventDate(e.starts_at, undefined, languageTags[language])}</td>
                  <td>
                    {e.status} / {e.registration_status}
                  </td>
                  <td>
                    <div className="stack">
                      <Link href={`/admin/events/${e.id}/edit`}>{t('Editar')}</Link>
                      <Link href={`/admin/events/${e.id}/attendees`}>{t('Participantes')}</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="notice">
          {t('No hay eventos en esta vista. Creá un borrador para empezar.')}
        </div>
      )}
      <h2 className="section-title">{t('Agregar un espacio.')}</h2>
      <ActionForm action={staffMutation} submit={t('Guardar espacio')}>
        <input type="hidden" name="action" value="venue" />
        <Field name="name" label={t('Nombre del lugar')} required />
        <Field name="address" label={t('Dirección')} required />
        <Field name="map_url" label={t('Enlace al mapa (https, opcional)')} type="url" />
      </ActionForm>
    </>
  );
}

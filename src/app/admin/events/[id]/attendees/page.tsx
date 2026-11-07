import { getI18n } from '@/lib/i18n/server';
import { notFound } from 'next/navigation';
import { requireStaff } from '@/features/auth/guards';
import { PageIntro } from '@/components/sections';
import { ActionForm } from '@/components/action-form';
import { staffMutation } from '@/features/admin/actions';
export default async function Attendees({ params }: { params: Promise<{ id: string }> }) {
  const { t, language } = await getI18n();
  const member = await requireStaff();
  const { id } = await params;
  const { data: event, error: eventError } = await member.client
    .from('events')
    .select('id,title')
    .eq('id', id)
    .maybeSingle();
  if (eventError) throw new Error('Could not load event');
  if (!event) notFound();
  const { data, error } = await member.client
    .from('event_registrations')
    .select('id,status,attended_at,profiles(display_name,city)')
    .eq('event_id', id)
    .order('created_at');
  if (error) throw new Error('Could not load attendees');
  return (
    <>
      <PageIntro label={event.title} title={t('Participantes.')} />
      <a className="button button-secondary" href={`/api/admin/events/${id}/export`}>
        {t('Exportar lista CSV')}
      </a>
      {!data.length ? (
        <div className="notice">{t('Todavía no hay inscripciones.')}</div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('Persona')}</th>
                <th>{t('Inscripción')}</th>
                <th>{t('Asistencia')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => {
                const p = r.profiles as unknown as { display_name: string; city: string } | null;
                return (
                  <tr key={r.id}>
                    <td>
                      {p?.display_name || t('Perfil no disponible')}
                      <br />
                      <span className="muted">{p?.city}</span>
                    </td>
                    <td>{r.status}</td>
                    <td>
                      {r.status === 'confirmed' && (
                        <ActionForm
                          action={staffMutation}
                          submit={r.attended_at ? t('Quitar asistencia') : t('Marcar presente')}
                        >
                          <input type="hidden" name="action" value="attendance" />
                          <input type="hidden" name="id" value={r.id} />
                          <input
                            type="hidden"
                            name="attended"
                            value={r.attended_at ? 'false' : 'true'}
                          />
                        </ActionForm>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

import { getI18n } from '@/lib/i18n/server';
import Link from '@/components/localized-link';
import { requireMember } from '@/features/auth/guards';
import { PageIntro, EmptyState } from '@/components/sections';
import { eventDate } from '@/lib/utils';
export default async function MyEvents() {
  const { t, language } = await getI18n();
  const member = await requireMember();
  const { data, error } = await member.client
    .from('event_registrations')
    .select('id,status,created_at,events(title,slug,starts_at)')
    .eq('member_id', member.user.id)
    .order('created_at', { ascending: false });
  if (error) throw new Error('Could not load registrations');
  return (
    <>
      <PageIntro label={t('Tu agenda')} title={t('Mis eventos.')} />
      {data.length ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('Encuentro')}</th>
                <th>{t('Fecha')}</th>
                <th>{t('Inscripción')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => {
                const e = r.events as unknown as {
                  title: string;
                  slug: string;
                  starts_at: string;
                } | null;
                return (
                  <tr key={r.id}>
                    <td>
                      {e ? (
                        <Link href={`/events/${e.slug}`}>{e.title}</Link>
                      ) : (
                        t('Evento no disponible')
                      )}
                    </td>
                    <td>
                      {e
                        ? eventDate(e.starts_at, undefined, language === 'en' ? 'en' : 'es-AR')
                        : '—'}
                    </td>
                    <td>
                      {r.status === 'confirmed'
                        ? t('Confirmada')
                        : r.status === 'waitlisted'
                          ? t('Lista de espera')
                          : t('Cancelada')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState />
      )}
    </>
  );
}

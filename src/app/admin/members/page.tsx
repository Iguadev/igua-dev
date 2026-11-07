import { getI18n } from '@/lib/i18n/server';
import { requireStaff } from '@/features/auth/guards';
import { PageIntro } from '@/components/sections';
import { ActionForm } from '@/components/action-form';
import { staffMutation } from '@/features/admin/actions';
export default async function Members({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { t, language } = await getI18n();
  const member = await requireStaff(true);
  const { q = '' } = await searchParams;
  const term = q.replace(/[%_\\]/g, '').slice(0, 80);
  const [data, prefs] = await Promise.all([
    member.client
      .from('profiles')
      .select('id,display_name,city,member_roles(role)')
      .ilike('display_name', `%${term}%`)
      .order('created_at', { ascending: false })
      .limit(100),
    member.client
      .from('member_preferences')
      .select('member_id,deletion_requested_at')
      .not('deletion_requested_at', 'is', null),
  ]);
  if (data.error || prefs.error) throw new Error('Could not load members');
  return (
    <>
      <PageIntro label={t('Personas de la comunidad')} title={t('Integrantes.')} />
      <form className="form" method="get">
        <div>
          <label htmlFor="q">{t('Buscar por nombre')}</label>
          <input name="q" id="q" defaultValue={q} maxLength={80} />
        </div>
        <button className="button button-secondary" type="submit">
          {t('Buscar')}
        </button>
      </form>
      <p style={{ fontSize: 12, marginTop: 18 }}>
        {t('Hasta 100 resultados por búsqueda. Los emails no se muestran en este directorio.')}
      </p>
      {data.data.length ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('Persona')}</th>
                <th>{t('Ciudad')}</th>
                <th>{t('Rol')}</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.display_name || t('Onboarding pendiente')}
                    {prefs.data.some((d) => d.member_id === p.id) && (
                      <div className="notice">
                        {t('Solicitó eliminación. Procesar según la guía de operaciones.')}
                      </div>
                    )}
                  </td>
                  <td>{p.city}</td>
                  <td>
                    <ActionForm action={staffMutation} submit={t('Actualizar rol')}>
                      <input type="hidden" name="action" value="role" />
                      <input type="hidden" name="id" value={p.id} />
                      <label className="sr-only" htmlFor={`role-${p.id}`}>
                        {t('Rol de') + ' '}
                        {p.display_name}
                      </label>
                      <select
                        id={`role-${p.id}`}
                        name="role"
                        defaultValue={p.member_roles[0]?.role || 'member'}
                      >
                        <option value="member">{t('Miembro')}</option>
                        <option value="contributor">{t('Colaborador')}</option>
                        <option value="organizer">{t('Organizador')}</option>
                        <option value="admin">{t('Administrador')}</option>
                      </select>
                    </ActionForm>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="notice">{t('No hay integrantes que coincidan con tu búsqueda.')}</div>
      )}
    </>
  );
}

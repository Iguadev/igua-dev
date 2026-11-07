import { getI18n } from '@/lib/i18n/server';
import { requireStaff } from '@/features/auth/guards';
import { PageIntro } from '@/components/sections';
import { ActionForm } from '@/components/action-form';
import { staffMutation } from '@/features/admin/actions';
export default async function Projects() {
  const { t, language } = await getI18n();
  const member = await requireStaff(true);
  const { data, error } = await member.client
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new Error('Could not load submissions');
  return (
    <>
      <PageIntro label={t('Moderación')} title={t('Proyectos de la comunidad.')} />
      {!data.length ? (
        <div className="notice">{t('No hay proyectos para revisar todavía.')}</div>
      ) : (
        <div className="stack">
          {data.map((p) => (
            <article key={p.id} className="info-panel">
              <span className="badge">
                {p.status} / {p.visibility}
              </span>
              <h2 style={{ marginTop: 15 }}>{p.title}</h2>
              <p style={{ whiteSpace: 'pre-line' }}>{p.description}</p>
              <div className="stack" style={{ marginBottom: 20 }}>
                {p.github_url && (
                  <a
                    href={p.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link"
                  >
                    {t('Repositorio ↗')}
                  </a>
                )}
                {p.demo_url && (
                  <a
                    href={p.demo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link"
                  >
                    {t('Demo ↗')}
                  </a>
                )}
              </div>
              <ActionForm action={staffMutation} submit={t('Guardar moderación')}>
                <input type="hidden" name="action" value="moderate" />
                <input type="hidden" name="id" value={p.id} />
                <div>
                  <label htmlFor={`status-${p.id}`}>{t('Decisión')}</label>
                  <select id={`status-${p.id}`} name="status">
                    <option value="published">{t('Aprobar')}</option>
                    <option value="rejected">{t('Rechazar')}</option>
                  </select>
                </div>
              </ActionForm>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

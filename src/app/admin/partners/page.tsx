import { getI18n } from '@/lib/i18n/server';
import { requireStaff } from '@/features/auth/guards';
import { PageIntro } from '@/components/sections';
import { ActionForm, Field } from '@/components/action-form';
import { staffMutation } from '@/features/admin/actions';
export default async function Partners() {
  const { t, language } = await getI18n();
  const member = await requireStaff(true);
  const [inquiries, partners] = await Promise.all([
    member.client
      .from('partnership_inquiries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
    member.client.from('partners').select('*').order('name'),
  ]);
  if (inquiries.error || partners.error) throw new Error('Could not load partnerships');
  return (
    <>
      <PageIntro label={t('Alianzas y propuestas')} title={t('Colaboraciones.')} />
      <h2 className="section-title">{t('Consultas recibidas.')}</h2>
      {!inquiries.data.length ? (
        <div className="notice">{t('Todavía no hay consultas de colaboración.')}</div>
      ) : (
        <div className="stack">
          {inquiries.data.map((i) => (
            <article className="info-panel" key={i.id}>
              <h3>{i.organization}</h3>
              <p>
                {i.name} / {i.email}
                <br />
                {i.category}
              </p>
              <p style={{ whiteSpace: 'pre-line' }}>{i.message}</p>
              <ActionForm action={staffMutation} submit={t('Actualizar consulta')}>
                <input name="action" type="hidden" value="inquiry" />
                <input name="id" type="hidden" value={i.id} />
                <div>
                  <label htmlFor={`inquiry-${i.id}`}>{t('Estado')}</label>
                  <select id={`inquiry-${i.id}`} name="status" defaultValue={i.status}>
                    <option value="new">{t('Nueva')}</option>
                    <option value="contacted">{t('Contactada')}</option>
                    <option value="closed">{t('Cerrada')}</option>
                  </select>
                </div>
              </ActionForm>
            </article>
          ))}
        </div>
      )}
      <h2 className="section-title" style={{ marginTop: 45 }}>
        {t('Publicar una alianza confirmada.')}
      </h2>
      <ActionForm action={staffMutation} submit={t('Guardar aliado')}>
        <input name="action" type="hidden" value="partner" />
        <Field name="name" label={t('Nombre de la organización')} required maxLength={150} />
        <Field name="website" label={t('Sitio web (opcional)')} type="url" />
        <Field name="category" label={t('Categoría de alianza')} required maxLength={60} />
        <label className="check-label">
          <input type="checkbox" name="approved" />
          {t('Confirmo que la alianza está aprobada y puede publicarse.')}
        </label>
      </ActionForm>
      {partners.data.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: 45 }}>
            {t('Alianzas guardadas.')}
          </h2>
          <div className="stack">
            {partners.data.map((p) => (
              <div className="info-panel" key={p.id}>
                <h3>{p.name}</h3>
                <ActionForm action={staffMutation} submit={t('Actualizar visibilidad')}>
                  <input type="hidden" name="action" value="partner" />
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="name" value={p.name} />
                  <input type="hidden" name="website" value={p.website || ''} />
                  <input type="hidden" name="category" value={p.category} />
                  <label className="check-label">
                    <input type="checkbox" name="approved" defaultChecked={p.approved} />
                    {t('Publicar aliado confirmado')}
                  </label>
                </ActionForm>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

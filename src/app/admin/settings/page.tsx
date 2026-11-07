import { getI18n } from '@/lib/i18n/server';
import { requireStaff } from '@/features/auth/guards';
import { PageIntro } from '@/components/sections';
export default async function Settings() {
  const { t, language } = await getI18n();
  const member = await requireStaff(true);
  const { data, error } = await member.client
    .from('audit_logs')
    .select('id,created_at,action,table_name,record_id')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw new Error('Could not load audit');
  const connections = [
    [t('Base de datos'), !!process.env.NEXT_PUBLIC_SUPABASE_URL],
    [t('Correo transaccional'), !!process.env.RESEND_API_KEY && !!process.env.SUPABASE_SECRET_KEY],
    [t('Protección de formularios'), !!process.env.RATE_LIMIT_SECRET],
    [t('Monitoreo'), !!process.env.NEXT_PUBLIC_SENTRY_DSN],
    [t('Procesamiento de correo'), !!process.env.CRON_SECRET],
  ];
  return (
    <>
      <PageIntro label={t('Operaciones')} title={t('Configuración y auditoría.')} />
      <div className="metrics">
        {connections.map(([label, ready]) => (
          <div key={String(label)} className="metric">
            <span>{label}</span>
            <p>{ready ? t('Configurado') : t('Pendiente')}</p>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 13 }}>
        {t(
          'La configuración sensible se administra con variables de entorno. Nunca se muestran claves en este panel.',
        )}
      </p>
      <h2 className="section-title" style={{ marginTop: 40 }}>
        {t('Últimos 50 cambios.')}
      </h2>
      {data.length ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('Fecha')}</th>
                <th>{t('Acción')}</th>
                <th>{t('Recurso')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a) => (
                <tr key={a.id}>
                  <td>{a.created_at}</td>
                  <td>{a.action}</td>
                  <td>
                    {a.table_name}
                    <br />
                    <small>{a.record_id}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="notice">{t('No hay cambios registrados.')}</div>
      )}
    </>
  );
}

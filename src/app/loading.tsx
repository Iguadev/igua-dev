import { getI18n } from '@/lib/i18n/server';
export default async function Loading() {
  const { t, language } = await getI18n();
  return (
    <div className="container loading-state" role="status">
      <div className="loading-bar" />
      <div className="loading-bar" />
      <div className="loading-bar" />
      <span>{t('Cargando IGUA.DEV…')}</span>
    </div>
  );
}

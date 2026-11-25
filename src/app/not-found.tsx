import { languagePath } from '@/lib/i18n/routing';
import { getI18n } from '@/lib/i18n/server';
import { localizeMetadata } from '@/lib/seo';
import Link from '@/components/localized-link';
import { Button } from '@/components/ui/button';
export async function generateMetadata() {
  const { language } = await getI18n();
  return localizeMetadata(
    {
      title: 'Por acá todavía no construimos.',
      robots: { index: false, follow: true },
    },
    language,
  );
}
export default async function NotFound() {
  const { t, language } = await getI18n();
  return (
    <div className="container page-content">
      <div className="page-intro">
        <div className="eyebrow">{t('404 / Ruta sin explorar')}</div>
        <h1>{t('Por acá todavía no construimos.')}</h1>
        <p>{t('Esta página no existe o no está disponible para tu cuenta.')}</p>
      </div>
      <Button asChild>
        <Link href={languagePath(language, '/')}>{t('Volver al inicio')}</Link>
      </Button>
    </div>
  );
}

import { getI18n } from '@/lib/i18n/server';
import { localizeMetadata } from '@/lib/seo';
import { PageIntro } from '@/components/sections';
import { AuthPanel } from '@/components/auth-panel';
const pageMetadata = {
  title: 'Sumate a la comunidad',
  description:
    'Sumate gratis a IGUA.DEV. Un lugar para aprender, construir y conectar desde Puerto Iguazú.',
  alternates: { canonical: '/join' },
};
export async function generateMetadata() {
  const { language } = await getI18n();
  return localizeMetadata(pageMetadata, language);
}
export default async function Join() {
  const { t, language } = await getI18n();
  return (
    <div className="container page-content">
      <div className="auth-layout">
        <div>
          <PageIntro
            label={t('La comunidad empieza con vos')}
            title={t('No tenés que hacerlo por tu cuenta.')}
          >
            <p>
              {t(
                'Si te da curiosidad cómo se construyen las cosas, este es tu lugar. Sin importar tu experiencia, tu stack o de dónde vengas.',
              )}
            </p>
          </PageIntro>
          <div className="prose">
            <h2>{t('Traé tus ganas de hacer.')}</h2>
            <p>
              {t(
                'Conocé personas, participá en encuentros y compartí tus proyectos. La membresía es gratuita.',
              )}
            </p>
            <p>
              {t(
                'Vos elegís qué compartir. Tu perfil es privado hasta que decidas hacerlo público.',
              )}
            </p>
          </div>
        </div>
        <AuthPanel />
      </div>
    </div>
  );
}

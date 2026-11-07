import { getI18n } from '@/lib/i18n/server';
import { localizeMetadata } from '@/lib/seo';
import { PageIntro } from '@/components/sections';
import { AuthPanel } from '@/components/auth-panel';
import { supabaseConfig } from '@/lib/env';
import { safeNext } from '@/lib/utils';
const pageMetadata = { title: 'Ingresar', robots: { index: false, follow: false } };
export async function generateMetadata() {
  const { language } = await getI18n();
  return localizeMetadata(pageMetadata, language);
}
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { t, language } = await getI18n();
  const query = await searchParams;
  return (
    <div className="container page-content">
      <div className="auth-layout">
        <div>
          <PageIntro label={t('Qué bueno encontrarte')} title={t('Sigamos construyendo.')}>
            <p>
              {t(
                'Entrá a tu espacio para gestionar tus encuentros, actualizar tu perfil y compartir lo que estás creando.',
              )}
            </p>
          </PageIntro>
          {query.error && (
            <div className="form-message error" role="alert">
              {t('El enlace no es válido o ya venció. Pedí uno nuevo para ingresar.')}
            </div>
          )}
        </div>
        <AuthPanel enabled={!!supabaseConfig()} next={safeNext(query.next)} />
      </div>
    </div>
  );
}

import { getI18n } from '@/lib/i18n/server';
import { localizeMetadata } from '@/lib/seo';
import { PageIntro } from '@/components/sections';
import { AuthPanel } from '@/components/auth-panel';
import { identity } from '@/features/auth/guards';
import { memberDestination } from '@/features/auth/destination';
import { redirect } from 'next/navigation';
const pageMetadata = { title: 'Ingresar', robots: { index: false, follow: false } };
export async function generateMetadata() {
  const { language } = await getI18n();
  return localizeMetadata(pageMetadata, language);
}
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [{ t, language }, query, member] = await Promise.all([getI18n(), searchParams, identity()]);
  if (member) redirect(memberDestination(language, query.next, member.profile?.onboarded === true));
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
        </div>
        <AuthPanel next={query.next} />
      </div>
    </div>
  );
}

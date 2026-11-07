import { languagePath } from '@/lib/i18n/routing';
import { getI18n } from '@/lib/i18n/server';
import Link from '@/components/localized-link';
import { requireMember } from '@/features/auth/guards';
import { PageIntro } from '@/components/sections';
import { ActionForm } from '@/components/action-form';
import { requestDeletion } from '@/features/members/actions';
export default async function Settings() {
  const { t, language } = await getI18n();
  const member = await requireMember();
  const { data, error } = await member.client
    .from('member_preferences')
    .select('deletion_requested_at')
    .eq('member_id', member.user.id)
    .single();
  if (error) throw new Error('Could not load preferences');
  return (
    <>
      <PageIntro label={t('Tu cuenta')} title={t('Configuración.')} />
      <div className="prose">
        <h2>{t('Privacidad y comunicaciones.')}</h2>
        <p>
          <Link href={languagePath(language, '/dashboard/profile')}>
            {t('Actualizá tu perfil')}
          </Link>
          {' ' + t('para elegir qué compartir públicamente y si querés recibir novedades.')}
        </p>
        <h2>{t('Solicitar eliminación.')}</h2>
        <p>
          {t(
            'Ocultamos tu perfil al registrar la solicitud. La organización debe completar la eliminación de la cuenta y sus archivos; la solicitud no la borra de inmediato.',
          )}
        </p>
      </div>
      {data?.deletion_requested_at ? (
        <div className="notice">
          {t('Tu solicitud de eliminación está registrada. La organización debe procesarla.')}
        </div>
      ) : (
        <ActionForm
          action={requestDeletion}
          submit={t('Solicitar eliminación de mi cuenta')}
          danger
        >
          <label className="check-label">
            <input name="confirm" type="checkbox" required />
            {t(
              'Quiero solicitar la eliminación de mi cuenta y entiendo que la organización debe completarla.',
            )}
          </label>
        </ActionForm>
      )}
    </>
  );
}

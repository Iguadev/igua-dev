import { getI18n } from '@/lib/i18n/server';
import { languagePath } from '@/lib/i18n/routing';
import { ActionForm, Field } from './action-form';
import { magicLink, oauth } from '@/features/auth/actions';
export async function AuthPanel({
  enabled,
  next = '/dashboard',
}: {
  enabled: boolean;
  next?: string;
}) {
  const { t, language } = await getI18n();
  return (
    <div className="auth-panel">
      <h2>{t('Tu lugar en la comunidad.')}</h2>
      <p>{t('Ingresá o creá tu cuenta. Es gratis y no necesitás contraseña.')}</p>
      {!enabled && (
        <div className="notice">
          {t(
            'Estamos preparando la apertura de la comunidad. El registro y el acceso todavía no están habilitados.',
          )}
        </div>
      )}
      <div className="oauth-buttons">
        {[
          ['github', 'GitHub'],
          ['google', 'Google'],
        ].map(([provider, label]) => (
          <ActionForm
            key={provider}
            action={oauth}
            submit={`${language === 'en' ? 'Continue with' : 'Continuar con'} ${label}`}
            disabled={!enabled}
          >
            <input type="hidden" name="provider" value={provider} />
            <input type="hidden" name="next" value={languagePath(language, next)} />
          </ActionForm>
        ))}
      </div>
      <div className="form-divider">{t('o con tu email')}</div>
      <ActionForm action={magicLink} submit={t('Enviarme un enlace')} disabled={!enabled}>
        <input type="hidden" name="next" value={languagePath(language, next)} />
        <Field
          label="Email"
          name="email"
          type="email"
          placeholder={language === 'en' ? 'you@example.com' : 'vos@ejemplo.com'}
          required
          maxLength={254}
        />
      </ActionForm>
      <p style={{ fontSize: 11, marginTop: 22, marginBottom: 0 }}>
        {t('Tu email es privado. Al continuar aceptás nuestro')}{' '}
        <a
          className="text-link"
          style={{ fontSize: 11 }}
          href={languagePath(language, '/reglamento')}
        >
          {t('código de convivencia')}
        </a>{' '}
        {t('y la')}{' '}
        <a className="text-link" style={{ fontSize: 11 }} href={languagePath(language, '/privacy')}>
          {t('política de privacidad')}
        </a>
        .
      </p>
    </div>
  );
}

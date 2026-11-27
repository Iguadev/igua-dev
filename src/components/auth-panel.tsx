import { getI18n } from '@/lib/i18n/server';
import { languagePath } from '@/lib/i18n/routing';
import { pollarPublishableKey } from '@/lib/env';
import { rateLimitConfigured } from '@/lib/rate-limit';
import { PollarAuth } from './pollar-auth';
export async function AuthPanel({ next = '/dashboard' }: { next?: string }) {
  const { t, language } = await getI18n();
  const pollarKey = rateLimitConfigured() ? pollarPublishableKey() : null;
  return (
    <div className="auth-panel">
      <h2>{t('Tu lugar en la comunidad.')}</h2>
      <p>{t('Ingresá o creá tu cuenta. Es gratis y no necesitás contraseña.')}</p>
      {pollarKey ? (
        <PollarAuth apiKey={pollarKey} next={languagePath(language, next)} />
      ) : (
        <div className="notice">
          {t(
            'Estamos preparando la apertura de la comunidad. El registro y el acceso todavía no están habilitados.',
          )}
        </div>
      )}
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

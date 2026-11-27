'use client';

import { PollarProvider, usePollar } from '@pollar/react';
import '@pollar/react/styles.css';
import { useEffect, useEffectEvent, useState } from 'react';
import type { PollarClientConfig } from '@pollar/core';
import { ActionForm, Field } from '@/components/action-form';
import { useI18n } from '@/components/i18n/provider';
import { Button } from '@/components/ui/button';
import { magicLink } from '@/features/auth/actions';

export function PollarAuthFlow({ apiKey, next }: { apiKey: string; next: string }) {
  const [client] = useState<PollarClientConfig>(() => {
    // IGUA.DEV owns the persistent login. Keep the onboarding session in this panel.
    const values = new Map<string, string>();
    return {
      apiKey,
      stellarNetwork: apiKey.startsWith('pub_mainnet_') ? 'mainnet' : 'testnet',
      logLevel: 'silent',
      storage: {
        async get(key: string) {
          return values.get(key) ?? null;
        },
        async set(key: string, value: string) {
          values.set(key, value);
        },
        async remove(key: string) {
          values.delete(key);
        },
      },
    };
  });
  return (
    <PollarProvider client={client}>
      <PollarSignIn next={next} />
    </PollarProvider>
  );
}

function PollarSignIn({ next }: { next: string }) {
  const { t } = useI18n();
  const { getClient, isAuthenticated, verified, openLoginModal, logout } = usePollar();
  const connected = isAuthenticated && verified;
  const email = connected ? getClient().getUserProfile()?.mail : undefined;

  const openOnMount = useEffectEvent(openLoginModal);
  useEffect(() => {
    openOnMount();
  }, []);

  if (!connected) {
    return (
      <Button className="auth-continue" lang="en" type="button" onClick={openLoginModal}>
        Continue
      </Button>
    );
  }

  return (
    <div className="form">
      <p role="status">
        {email ? (
          <>
            {t('Ya ingresaste en Pollar. Confirmá este email para continuar en IGUA.DEV.')}{' '}
            <strong>{email}</strong>
          </>
        ) : (
          t('Ya ingresaste en Pollar. Ingresá un email para confirmar tu acceso a IGUA.DEV.')
        )}
      </p>
      <ActionForm action={magicLink} submit={t('Enviarme un enlace')}>
        <input type="hidden" name="next" value={next} />
        {email ? (
          <input type="hidden" name="email" value={email} />
        ) : (
          <Field label="Email" name="email" type="email" required maxLength={254} />
        )}
      </ActionForm>
      <Button type="button" variant="outline" onClick={logout}>
        {t('Cambiar de cuenta de Pollar')}
      </Button>
    </div>
  );
}

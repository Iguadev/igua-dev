'use client';

import { PollarProvider, usePollar } from '@pollar/react';
import '@pollar/react/styles.css';
import { useEffect, useEffectEvent, useRef, useState, useTransition } from 'react';
import { buildProof, defaultKeyManager, type PollarClientConfig } from '@pollar/core';
import { useI18n } from '@/components/i18n/provider';
import { Button } from '@/components/ui/button';
import { signInWithPollar } from '@/features/auth/actions';
import { pollarSessionUrl } from '@/lib/env';

export function PollarAuthFlow({ apiKey, next }: { apiKey: string; next: string }) {
  const [client] = useState(() => {
    // The app keeps the member session in its server-issued cookies.
    const values = new Map<string, string>();
    const storage = {
      async get(key: string) {
        return values.get(key) ?? null;
      },
      async set(key: string, value: string) {
        values.set(key, value);
      },
      async remove(key: string) {
        values.delete(key);
      },
    };
    return {
      apiKey,
      stellarNetwork: apiKey.startsWith('pub_mainnet_') ? 'mainnet' : 'testnet',
      logLevel: 'silent',
      storage,
      keyManager: defaultKeyManager(storage, apiKey),
    } satisfies PollarClientConfig;
  });
  return (
    <PollarProvider client={client}>
      <PollarSignIn next={next} keyManager={client.keyManager} />
    </PollarProvider>
  );
}

function PollarSignIn({
  next,
  keyManager,
}: {
  next: string;
  keyManager: NonNullable<PollarClientConfig['keyManager']>;
}) {
  const { t } = useI18n();
  const { isAuthenticated, verified, openLoginModal } = usePollar();
  const openOnMount = useEffectEvent(openLoginModal);
  useEffect(() => {
    openOnMount();
  }, []);

  return isAuthenticated && verified ? (
    <PollarSession next={next} keyManager={keyManager} />
  ) : (
    <Button className="auth-continue" type="button" onClick={openLoginModal}>
      {t('Continuar con Pollar')}
    </Button>
  );
}

function PollarSession({
  next,
  keyManager,
}: {
  next: string;
  keyManager: NonNullable<PollarClientConfig['keyManager']>;
}) {
  const { t } = useI18n();
  const { getClient, logout } = usePollar();
  const [status, setStatus] = useState<'error' | 'account-conflict'>();
  const [pending, startTransition] = useTransition();
  const started = useRef(false);

  function signIn() {
    startTransition(async () => {
      try {
        const state = getClient().getAuthState();
        if (state.step === 'authenticated' && state.verified) {
          const { accessToken } = state.session.token;
          const request = { htm: 'GET', htu: pollarSessionUrl, accessToken };
          const proof = await buildProof(request, keyManager);
          let result = await signInWithPollar({ accessToken, proof }, next);
          if (!result) return; // The action redirected after setting the session cookie.
          if (result.status === 'nonce') {
            const proof = await buildProof(
              { ...request, nonce: result.nonce, clockOffsetSec: result.clockOffsetSec },
              keyManager,
            );
            result = await signInWithPollar({ accessToken, proof }, next);
            if (!result) return;
          }
          setStatus(result.status === 'account-conflict' ? 'account-conflict' : 'error');
          return;
        }
      } catch {
        // A failed exchange leaves the Pollar account available for retry or switching.
      }
      setStatus('error');
    });
  }

  const signInOnMount = useEffectEvent(signIn);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    signInOnMount();
  }, []);

  if (pending || !status) return <p role="status">{t('Estamos abriendo tu sesión…')}</p>;

  return (
    <div className="form">
      <p role="alert">
        {status === 'account-conflict'
          ? t('Estos métodos están asociados a cuentas distintas. Ingresá con tu método habitual.')
          : t('No pudimos iniciar sesión. Intentá de nuevo.')}
      </p>
      {status === 'error' && (
        <Button type="button" onClick={signIn}>
          {t('Intentar de nuevo')}
        </Button>
      )}
      <Button type="button" variant="outline" onClick={logout}>
        {t('Cambiar de cuenta de Pollar')}
      </Button>
    </div>
  );
}
